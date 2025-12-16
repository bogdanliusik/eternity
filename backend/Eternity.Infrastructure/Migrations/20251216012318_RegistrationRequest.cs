using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RegistrationRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "registration_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    requested_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_registration_requests", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_registration_requests_email",
                table: "registration_requests",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_registration_requests_status",
                table: "registration_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_registration_requests_user_name",
                table: "registration_requests",
                column: "user_name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "registration_requests");
        }
    }
}
