using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.AutoService.Api.References
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReferencesController(IReferenceService referenceService) : ControllerBase
    {
    }
}
