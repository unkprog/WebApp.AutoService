using WebApp.AutoService.Api.References.Models;

namespace WebApp.AutoService.Api.References
{
    public class ReferenceRepository : IReferenceRepository
    {
        public async Task<CurrencyModel> GetCurrencyAsync(int Id)
        {
            var sql = $@"	
            select [currency].[id] {nameof(SCAttachModel.FileId)}
                 , [currency].[Jrn_Data_Id] {nameof(SCAttachModel.TicketId)}
                 , [currency].[Отсканированный_Документ] {nameof(SCAttachModel.FilePath)}
                 , [currency].[Имя_файла] {nameof(SCAttachModel.FileName)}
                 , [currency].[Тип_документа_id] {nameof(SCAttachModel.FileTypeId)}
                 , [currency].[Комментарий] {nameof(SCAttachModel.Commentary)}
                 , [currency].[UserId] {nameof(SCAttachModel.UserId)}
                 , [currency].[DateChange] {nameof(SCAttachModel.DateChange)}
                 , [currency].[TypeAttach] {nameof(SCAttachModel.TypeAttach)}
	        from  [Ref].[Currency] [currency]
	        where [currency].[Id] = @{nameof(Id)}
            ";

            using var connection = new SqlConnection(SqlUtilities.ConnectionStringBuilder(change: false, initialCatalog: "HelpDesk"));
            connection.Open();

            return await connection.QuerySingleOrDefaultAsync<CurrencyModel>(sql, new { Id });
        }
    }
}
