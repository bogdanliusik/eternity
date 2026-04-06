using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddCallEntities : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateTable(
            name: "calls",
            columns: table => new {
                id = table.Column<string>(type: "character varying(26)", maxLength: 26, nullable: false),
                initiator_id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                type = table.Column<int>(type: "integer", nullable: false),
                status = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                ended_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("pk_calls", x => x.id);
                table.ForeignKey(
                    name: "fk_calls_user_accounts_initiator_id",
                    column: x => x.initiator_id,
                    principalTable: "user_accounts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "call_participants",
            columns: table => new {
                id = table.Column<string>(type: "character varying(26)", maxLength: 26, nullable: false),
                call_id = table.Column<string>(type: "character varying(26)", maxLength: 26, nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                status = table.Column<int>(type: "integer", nullable: false),
                joined_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                left_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("pk_call_participants", x => x.id);
                table.ForeignKey(
                    name: "fk_call_participants_calls_call_id",
                    column: x => x.call_id,
                    principalTable: "calls",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_call_participants_user_accounts_user_id",
                    column: x => x.user_id,
                    principalTable: "user_accounts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_call_participants_call_id_user_id",
            table: "call_participants",
            columns: new[] { "call_id", "user_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_call_participants_user_id",
            table: "call_participants",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_call_participants_user_id_status",
            table: "call_participants",
            columns: new[] { "user_id", "status" });

        migrationBuilder.CreateIndex(
            name: "ix_calls_created_at",
            table: "calls",
            column: "created_at");

        migrationBuilder.CreateIndex(
            name: "ix_calls_initiator_id",
            table: "calls",
            column: "initiator_id");

        migrationBuilder.CreateIndex(
            name: "ix_calls_status",
            table: "calls",
            column: "status");

        migrationBuilder.CreateIndex(
            name: "ix_calls_status_created_at",
            table: "calls",
            columns: new[] { "status", "created_at" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "call_participants");

        migrationBuilder.DropTable(
            name: "calls");
    }
}
