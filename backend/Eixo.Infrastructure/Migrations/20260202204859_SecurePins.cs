using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eixo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SecurePins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Pin",
                value: "$2a$11$JIL1A7EK2PhOUNehEOVPl.YqTdQY4NOXrsTPAaFOdnFMZNdKuPFBa");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Pin",
                value: "$2a$11$JIL1A7EK2PhOUNehEOVPl.YqTdQY4NOXrsTPAaFOdnFMZNdKuPFBa");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Pin",
                value: "$2a$11$JIL1A7EK2PhOUNehEOVPl.YqTdQY4NOXrsTPAaFOdnFMZNdKuPFBa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Pin",
                value: "1234");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Pin",
                value: "1234");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Pin",
                value: "1234");
        }
    }
}
