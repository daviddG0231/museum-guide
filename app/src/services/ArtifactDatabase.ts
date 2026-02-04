/**
 * ArtifactDatabase - Local artifact data storage and retrieval
 * 
 * Uses SQLite for structured data and embeddings index for similarity search.
 * Designed to work fully offline with downloaded museum packs.
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Artifact } from '../types';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

class ArtifactDatabaseClass {
  private isInitialized = false;

  /**
   * Initialize the database
   * Creates tables if they don't exist
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    db = await SQLite.openDatabaseAsync('museum_guide.db');
    
    // Create artifacts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_arabic TEXT,
        category TEXT NOT NULL,
        dynasty TEXT,
        period TEXT,
        date_approx TEXT,
        material TEXT,
        dimensions TEXT,
        weight TEXT,
        discovery_date TEXT,
        discovery_location TEXT,
        discovery_discoverer TEXT,
        location_in_museum TEXT,
        story_facts TEXT,
        connections TEXT,
        tags TEXT,
        embedding BLOB
      );

      CREATE INDEX IF NOT EXISTS idx_category ON artifacts(category);
      CREATE INDEX IF NOT EXISTS idx_name ON artifacts(name);
    `);

    this.isInitialized = true;
    console.log('Artifact database initialized');
  }

  /**
   * Get artifact by ID
   */
  async getById(id: string): Promise<Artifact | null> {
    if (!db) await this.initialize();

    const result = await db!.getFirstAsync<any>(
      'SELECT * FROM artifacts WHERE id = ?',
      [id]
    );

    return result ? this.rowToArtifact(result) : null;
  }

  /**
   * Search artifacts by name (fuzzy matching)
   */
  async searchByName(query: string): Promise<Artifact | null> {
    if (!db) await this.initialize();

    const normalizedQuery = query.toLowerCase().trim();
    
    // Try exact match first
    let result = await db!.getFirstAsync<any>(
      'SELECT * FROM artifacts WHERE LOWER(name) = ?',
      [normalizedQuery]
    );

    // Try partial match
    if (!result) {
      result = await db!.getFirstAsync<any>(
        'SELECT * FROM artifacts WHERE LOWER(name) LIKE ?',
        [`%${normalizedQuery}%`]
      );
    }

    return result ? this.rowToArtifact(result) : null;
  }

  /**
   * Get artifacts by category
   */
  async getByCategory(category: string): Promise<Artifact[]> {
    if (!db) await this.initialize();

    const results = await db!.getAllAsync<any>(
      'SELECT * FROM artifacts WHERE category = ?',
      [category]
    );

    return results.map(this.rowToArtifact);
  }

  /**
   * Get all artifacts
   */
  async getAll(): Promise<Artifact[]> {
    if (!db) await this.initialize();

    const results = await db!.getAllAsync<any>(
      'SELECT * FROM artifacts ORDER BY name'
    );

    return results.map(this.rowToArtifact);
  }

  /**
   * Insert or update an artifact
   */
  async upsert(artifact: Artifact): Promise<void> {
    if (!db) await this.initialize();

    await db!.runAsync(
      `INSERT OR REPLACE INTO artifacts (
        id, name, name_arabic, category, dynasty, period, date_approx,
        material, dimensions, weight, discovery_date, discovery_location,
        discovery_discoverer, location_in_museum, story_facts, connections, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        artifact.id,
        artifact.name,
        artifact.nameArabic || null,
        artifact.category,
        artifact.dynasty || null,
        artifact.period || null,
        artifact.dateApprox || null,
        artifact.material ? JSON.stringify(artifact.material) : null,
        artifact.dimensions || null,
        artifact.weight || null,
        artifact.discovery?.date || null,
        artifact.discovery?.location || null,
        artifact.discovery?.discoverer || null,
        artifact.locationInMuseum || null,
        JSON.stringify(artifact.storyFacts),
        artifact.connections ? JSON.stringify(artifact.connections) : null,
        artifact.tags ? JSON.stringify(artifact.tags) : null,
      ]
    );
  }

  /**
   * Bulk insert artifacts (for museum pack import)
   */
  async bulkInsert(artifacts: Artifact[]): Promise<void> {
    if (!db) await this.initialize();

    // Use transaction for speed
    for (const artifact of artifacts) {
      await this.upsert(artifact);
    }
  }

  /**
   * Import museum pack from file
   */
  async importMuseumPack(packPath: string): Promise<number> {
    const content = await FileSystem.readAsStringAsync(packPath);
    const data = JSON.parse(content);
    
    if (data.artifacts && Array.isArray(data.artifacts)) {
      await this.bulkInsert(data.artifacts);
      return data.artifacts.length;
    }
    
    return 0;
  }

  /**
   * Get database stats
   */
  async getStats(): Promise<{ totalArtifacts: number; categories: string[] }> {
    if (!db) await this.initialize();

    const countResult = await db!.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM artifacts'
    );
    
    const categoriesResult = await db!.getAllAsync<{ category: string }>(
      'SELECT DISTINCT category FROM artifacts'
    );

    return {
      totalArtifacts: countResult?.count || 0,
      categories: categoriesResult.map(r => r.category),
    };
  }

  /**
   * Convert database row to Artifact object
   */
  private rowToArtifact(row: any): Artifact {
    return {
      id: row.id,
      name: row.name,
      nameArabic: row.name_arabic || undefined,
      category: row.category,
      dynasty: row.dynasty || undefined,
      period: row.period || undefined,
      dateApprox: row.date_approx || undefined,
      material: row.material ? JSON.parse(row.material) : undefined,
      dimensions: row.dimensions || undefined,
      weight: row.weight || undefined,
      discovery: row.discovery_location ? {
        date: row.discovery_date,
        location: row.discovery_location,
        discoverer: row.discovery_discoverer || undefined,
      } : undefined,
      locationInMuseum: row.location_in_museum || undefined,
      storyFacts: JSON.parse(row.story_facts || '[]'),
      connections: row.connections ? JSON.parse(row.connections) : undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    if (!db) await this.initialize();
    await db!.runAsync('DELETE FROM artifacts');
  }
}

export const ArtifactDatabase = new ArtifactDatabaseClass();
