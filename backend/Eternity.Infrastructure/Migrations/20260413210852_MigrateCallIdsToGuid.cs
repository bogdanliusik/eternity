using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eternity.Infrastructure.Migrations;

/// <inheritdoc />
public partial class MigrateCallIdsToGuid : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        // -----------------------------------------------------------------
        // Data migration: convert ULID string IDs (varchar 26) to UUIDs.
        // Strategy:
        //   1. Drop all FK constraints and indexes that reference the old columns.
        //   2. Add temporary uuid columns with generated values.
        //   3. Map call_participants.call_id via a join on the old ULID value.
        //   4. Drop old varchar columns, rename uuid columns to the original names.
        //   5. Recreate primary keys, foreign keys, and indexes.
        // -----------------------------------------------------------------

        migrationBuilder.Sql("""
            -- Step 1: Drop FK and indexes that depend on the old columns.
            ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS fk_call_participants_calls_call_id;
            ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS pk_call_participants;
            ALTER TABLE calls            DROP CONSTRAINT IF EXISTS pk_calls;

            DROP INDEX IF EXISTS ix_call_participants_call_id_user_id;
            DROP INDEX IF EXISTS ix_call_participants_user_id;
            DROP INDEX IF EXISTS ix_call_participants_user_id_status;

            -- Step 2a: calls – add new uuid id column.
            ALTER TABLE calls ADD COLUMN new_id uuid NOT NULL DEFAULT gen_random_uuid();
            UPDATE calls SET new_id = gen_random_uuid();
            ALTER TABLE calls ALTER COLUMN new_id DROP DEFAULT;

            -- Step 2b: call_participants – add new uuid id & call_id columns.
            ALTER TABLE call_participants ADD COLUMN new_id uuid NOT NULL DEFAULT gen_random_uuid();
            UPDATE call_participants SET new_id = gen_random_uuid();
            ALTER TABLE call_participants ALTER COLUMN new_id DROP DEFAULT;

            ALTER TABLE call_participants ADD COLUMN new_call_id uuid;

            -- Step 3: Map call_participants.new_call_id via old ULID FK.
            UPDATE call_participants cp
            SET new_call_id = c.new_id
            FROM calls c
            WHERE cp.call_id = c.id;

            ALTER TABLE call_participants ALTER COLUMN new_call_id SET NOT NULL;

            -- Step 4a: Drop old varchar columns.
            ALTER TABLE call_participants DROP COLUMN call_id;
            ALTER TABLE call_participants DROP COLUMN id;
            ALTER TABLE calls DROP COLUMN id;

            -- Step 4b: Rename new columns.
            ALTER TABLE calls RENAME COLUMN new_id TO id;
            ALTER TABLE call_participants RENAME COLUMN new_id TO id;
            ALTER TABLE call_participants RENAME COLUMN new_call_id TO call_id;

            -- Step 5: Recreate constraints and indexes.
            ALTER TABLE calls ADD CONSTRAINT pk_calls PRIMARY KEY (id);

            ALTER TABLE call_participants ADD CONSTRAINT pk_call_participants PRIMARY KEY (id);

            ALTER TABLE call_participants ADD CONSTRAINT fk_call_participants_calls_call_id
                FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE;

            CREATE UNIQUE INDEX ix_call_participants_call_id_user_id
                ON call_participants (call_id, user_id);

            CREATE INDEX ix_call_participants_user_id
                ON call_participants (user_id);

            CREATE INDEX ix_call_participants_user_id_status
                ON call_participants (user_id, status);
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        // Reverse: convert uuid columns back to varchar(26) ULID strings.
        // Note: original ULID values are lost; new string representations of UUIDs are used.
        migrationBuilder.Sql("""
            ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS fk_call_participants_calls_call_id;
            ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS pk_call_participants;
            ALTER TABLE calls            DROP CONSTRAINT IF EXISTS pk_calls;

            DROP INDEX IF EXISTS ix_call_participants_call_id_user_id;
            DROP INDEX IF EXISTS ix_call_participants_user_id;
            DROP INDEX IF EXISTS ix_call_participants_user_id_status;

            ALTER TABLE calls ADD COLUMN old_id character varying(26);
            UPDATE calls SET old_id = SUBSTRING(id::text, 1, 26);
            ALTER TABLE calls ALTER COLUMN old_id SET NOT NULL;

            ALTER TABLE call_participants ADD COLUMN old_id character varying(26);
            UPDATE call_participants SET old_id = SUBSTRING(id::text, 1, 26);
            ALTER TABLE call_participants ALTER COLUMN old_id SET NOT NULL;

            ALTER TABLE call_participants ADD COLUMN old_call_id character varying(26);
            UPDATE call_participants cp
            SET old_call_id = c.old_id
            FROM calls c
            WHERE cp.call_id = c.id;
            ALTER TABLE call_participants ALTER COLUMN old_call_id SET NOT NULL;

            ALTER TABLE call_participants DROP COLUMN call_id;
            ALTER TABLE call_participants DROP COLUMN id;
            ALTER TABLE calls DROP COLUMN id;

            ALTER TABLE calls RENAME COLUMN old_id TO id;
            ALTER TABLE call_participants RENAME COLUMN old_id TO id;
            ALTER TABLE call_participants RENAME COLUMN old_call_id TO call_id;

            ALTER TABLE calls ADD CONSTRAINT pk_calls PRIMARY KEY (id);
            ALTER TABLE call_participants ADD CONSTRAINT pk_call_participants PRIMARY KEY (id);
            ALTER TABLE call_participants ADD CONSTRAINT fk_call_participants_calls_call_id
                FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE;

            CREATE UNIQUE INDEX ix_call_participants_call_id_user_id
                ON call_participants (call_id, user_id);
            CREATE INDEX ix_call_participants_user_id
                ON call_participants (user_id);
            CREATE INDEX ix_call_participants_user_id_status
                ON call_participants (user_id, status);
            """);
    }
}
