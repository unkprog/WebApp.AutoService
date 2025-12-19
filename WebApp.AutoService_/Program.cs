var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();


// Конфигурация pipeline
if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// Обслуживание статических файлов (из wwwroot)
app.UseStaticFiles();
// Для обслуживания файлов из других папок:
// app.UseStaticFiles(new StaticFileOptions
// {
//     FileProvider = new PhysicalFileProvider(
//         Path.Combine(Directory.GetCurrentDirectory(), "OtherStatic")),
//     RequestPath = "/OtherStatic"
// });

//***app.MapGet("/", () => "Hello World!");

app.UseRouting();

// Fallback для SPA приложений
app.MapFallbackToFile("index.html");

app.Run();