using Eternity.Application;
using Eternity.Infrastructure;
using Eternity.Infrastructure.Data;
using Eternity.WebApi.Extensions;
using Eternity.WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();
builder.AddEternityAuthentication();
var app = builder.Build();
if (app.Environment.IsDevelopment() || app.Environment.IsProduction()) {
    await app.InitialiseDatabaseAsync();
}
app.UseForwardedHeaders();
app.UseRateLimiter();
app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseOpenApi(o => o.Path = "/api/specification.json");
app.UseSwaggerUi(settings => {
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});
app.MapEndpoints();
app.MapHub<GeneralHub>("/hubs/general");
app.MapHub<CallHub>("/hubs/call");
app.Run();
