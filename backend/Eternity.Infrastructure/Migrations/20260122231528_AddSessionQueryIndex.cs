using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddSessionQueryIndex : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateIndex(
            name: "ix_user_sessions_is_terminated_ended_at_refresh_token_expiry",
            table: "user_sessions",
            columns: new[] { "is_terminated", "ended_at", "refresh_token_expiry" });

        migrationBuilder.CreateIndex(
            name: "ix_user_sessions_is_terminated_refresh_token_expiry",
            table: "user_sessions",
            columns: new[] { "is_terminated", "refresh_token_expiry" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropIndex(
            name: "ix_user_sessions_is_terminated_ended_at_refresh_token_expiry",
            table: "user_sessions");

        migrationBuilder.DropIndex(
            name: "ix_user_sessions_is_terminated_refresh_token_expiry",
            table: "user_sessions");
    }
}
