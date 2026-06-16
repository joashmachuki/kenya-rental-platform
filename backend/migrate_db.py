import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("ALTER TABLE properties ADD COLUMN distance_from_road REAL")
cursor.execute("ALTER TABLE properties ADD COLUMN elevator BOOLEAN DEFAULT 0")
cursor.execute("ALTER TABLE properties ADD COLUMN electricity_reliability VARCHAR(50) DEFAULT 'consistent'")
cursor.execute("ALTER TABLE properties ADD COLUMN security BOOLEAN DEFAULT 0")
cursor.execute("ALTER TABLE properties ADD COLUMN balcony BOOLEAN DEFAULT 0")
cursor.execute("ALTER TABLE properties ADD COLUMN kitchen_type VARCHAR(50) DEFAULT 'closed'")
cursor.execute("ALTER TABLE properties ADD COLUMN garbage_collection BOOLEAN DEFAULT 0")
cursor.execute("ALTER TABLE properties ADD COLUMN nearby_amenities TEXT DEFAULT '[]'")
cursor.execute("ALTER TABLE properties ADD COLUMN bathroom_type VARCHAR(50) DEFAULT 'shared'")
cursor.execute("ALTER TABLE properties ADD COLUMN pet_policy VARCHAR(50) DEFAULT 'not_allowed'")

conn.commit()
conn.close()
print("Migration complete")
