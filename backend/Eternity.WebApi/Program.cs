using Eternity.Application;
using Eternity.Infrastructure;
using Eternity.Infrastructure.Data;
using Eternity.WebApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();
builder.AddEternityAuthentication();

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    await app.InitialiseDatabaseAsync();
}

app.UseHealthChecks("/health");
app.UseHttpsRedirection();

app.UseOpenApi(o => o.Path = "/api/specification.json");

app.UseSwaggerUi(settings => {
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});

app.MapEndpoints();

app.Run();
