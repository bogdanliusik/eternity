using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddFullName : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "is_online",
            table: "user_accounts");

        migrationBuilder.AddColumn<string>(
            name: "full_name",
            table: "user_accounts",
            type: "character varying(256)",
            maxLength: 256,
            nullable: false,
            defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "full_name",
            table: "user_accounts");

        migrationBuilder.AddColumn<bool>(
            name: "is_online",
            table: "user_accounts",
            type: "boolean",
            nullable: false,
            defaultValue: false);
    }
}
