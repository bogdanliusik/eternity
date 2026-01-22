using System.Reflection;
using Eternity.Application.Common.Behaviours;
using Eternity.Application.Common.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Eternity.Application;

public static class DependencyInjection
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder) {
        builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        RegisterPaginatedQueryValidators(builder.Services, Assembly.GetExecutingAssembly());
        builder.Services.AddMediatR(cfg => { 
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ResponseHandlingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
        });
    }
    
    private static void RegisterPaginatedQueryValidators(IServiceCollection services, Assembly assembly) {
        var paginatedQueryTypes = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } 
                        && t.GetInterfaces().Contains(typeof(IPaginatedQuery)));
        
        foreach (var queryType in paginatedQueryTypes) {
            var validatorType = typeof(PaginatedQueryValidator<>).MakeGenericType(queryType);
            var validatorInterfaceType = typeof(IValidator<>).MakeGenericType(queryType);
            services.AddTransient(validatorInterfaceType, validatorType);
        }
    }
}
