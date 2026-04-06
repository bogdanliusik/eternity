using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddUserSessions : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "refresh_token",
            table: "AspNetUsers");

        migrationBuilder.DropColumn(
            name: "refresh_token_expiry",
            table: "AspNetUsers");

        migrationBuilder.CreateTable(
            name: "user_sessions",
            columns: table => new {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                refresh_token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                refresh_token_expiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                ended_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                user_agent = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                device_info = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                browser_info = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                is_terminated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table => {
                table.PrimaryKey("pk_user_sessions", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_user_sessions_refresh_token",
            table: "user_sessions",
            column: "refresh_token");

        migrationBuilder.CreateIndex(
            name: "ix_user_sessions_user_id",
            table: "user_sessions",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_sessions_user_id_is_terminated",
            table: "user_sessions",
            columns: new[] { "user_id", "is_terminated" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "user_sessions");

        migrationBuilder.AddColumn<string>(
            name: "refresh_token",
            table: "AspNetUsers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "refresh_token_expiry",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
    }
}
