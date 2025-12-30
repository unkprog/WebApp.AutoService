using Microsoft.Data.SqlClient;
using System.Collections.Concurrent;
using System.Data;
using System.Reflection;

namespace WebApp.AutoService.Db
{
    public static class Helper
    {
        private static readonly ConcurrentDictionary<Type, PropertyInfo[]> _propertyCache = new();
        private static readonly ConcurrentDictionary<string, PropertyInfo[]> _mappedPropertyCache = new();

        // Query
        public static List<T> Query<T>(this SqlConnection conn, string sql, object param = null) where T : new()
        {
            if (conn.State != ConnectionState.Open)
                conn.Open();

            try
            {
                using var cmd = CreateCommand(conn, sql, param);
                using var reader = cmd.ExecuteReader();

                var properties = GetCachedProperties<T>();
                var result = new List<T>();

                if (reader.HasRows)
                {
                    // Кэшируем маппинг полей на свойства
                    var fieldMappings = GetFieldMappings<T>(reader, properties);

                    while (reader.Read())
                        result.Add(CreateInstance<T>(reader, fieldMappings));
                }

                return result;
            }
            finally
            {
                if (conn.State == ConnectionState.Open)
                    conn.Close();
            }
        }

        // Execute
        public static int Execute(this SqlConnection conn, string sql, object param = null)
        {
            if (conn.State != ConnectionState.Open)
                conn.Open();

            try
            {
                using var cmd = CreateCommand(conn, sql, param);
                return cmd.ExecuteNonQuery();
            }
            finally
            {
                if (conn.State == ConnectionState.Open)
                    conn.Close();
            }
        }

        // Первая запись
        public static T First<T>(this SqlConnection conn, string sql, object param = null) where T : new()
        {
            if (conn.State != ConnectionState.Open)
                conn.Open();

            try
            {
                using var cmd = CreateCommand(conn, sql, param);
                using var reader = cmd.ExecuteReader(CommandBehavior.SingleRow);

                if (!reader.HasRows || !reader.Read())
                    return default;

                var properties = GetCachedProperties<T>();
                var fieldMappings = GetFieldMappings<T>(reader, properties);
                return CreateInstance<T>(reader, fieldMappings);
            }
            finally
            {
                if (conn.State == ConnectionState.Open)
                    conn.Close();
            }
        }

        // Создание команды с использованием Dapper-style параметров
        private static SqlCommand CreateCommand(SqlConnection conn, string sql, object param)
        {
            var cmd = new SqlCommand(sql, conn) { CommandType = CommandType.Text };

            if (param != null)
            {
                var parameters = param as IEnumerable<KeyValuePair<string, object>>;

                if (parameters != null)
                {
                    // Поддержка Dictionary параметров
                    foreach (var kvp in parameters)
                    {
                        cmd.Parameters.AddWithValue("@" + kvp.Key.TrimStart('@'), kvp.Value ?? DBNull.Value);
                    }
                }
                else
                {
                    // Поддержка анонимных объектов
                    foreach (var prop in param.GetType().GetProperties())
                    {
                        var value = prop.GetValue(param);
                        cmd.Parameters.AddWithValue("@" + prop.Name, value ?? DBNull.Value);
                    }
                }
            }

            return cmd;
        }

        private static PropertyInfo[] GetCachedProperties<T>()
        {
            var type = typeof(T);
            if (!_propertyCache.TryGetValue(type, out var properties))
            {
                properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
                _propertyCache[type] = properties;
            }
            return properties;
        }

        private static List<PropertyMapping> GetFieldMappings<T>(SqlDataReader reader, PropertyInfo[] properties)
        {
            var typeName = typeof(T).FullName;
            var cacheKey = $"{typeName}_{string.Join(",", Enumerable.Range(0, reader.FieldCount).Select(i => reader.GetName(i)))}";

            if (_mappedPropertyCache.TryGetValue(cacheKey, out var cachedProps))
            {
                return cachedProps.Select(prop => new PropertyMapping
                {
                    Property = prop,
                    Ordinal = reader.GetOrdinal(prop.Name)
                }).ToList();
            }

            var mappings = new List<PropertyMapping>();
            var propertyDict = properties.ToDictionary(p => p.Name, StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < reader.FieldCount; i++)
            {
                var fieldName = reader.GetName(i);
                if (propertyDict.TryGetValue(fieldName, out var prop))
                {
                    mappings.Add(new PropertyMapping
                    {
                        Property = prop,
                        Ordinal = i
                    });
                }
            }

            // Кэшируем свойства для этого конкретного набора полей
            _mappedPropertyCache[cacheKey] = mappings.Select(m => m.Property).ToArray();

            return mappings;
        }

        private static T CreateInstance<T>(SqlDataReader reader, List<PropertyMapping> mappings) where T : new()
        {
            var obj = new T();

            foreach (var mapping in mappings)
            {
                if (!reader.IsDBNull(mapping.Ordinal))
                {
                    var value = reader.GetValue(mapping.Ordinal);

                    // Простая конвертация типов
                    if (value != null && value.GetType() != mapping.Property.PropertyType)
                    {
                        try
                        {
                            value = Convert.ChangeType(value, mapping.Property.PropertyType);
                        }
                        catch
                        {
                            // Если не удалось сконвертировать, пропускаем
                            continue;
                        }
                    }

                    mapping.Property.SetValue(obj, value);
                }
            }

            return obj;
        }

        private class PropertyMapping
        {
            public PropertyInfo Property { get; set; }
            public int Ordinal { get; set; }
        }
    }
}