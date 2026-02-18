import { openDB } from 'idb'

const DB_NAME = 'b2g-offline'
const DB_VERSION = 1

// ─── Open / Init DB ───────────────────────────────────────────────────────────
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Quiz results pending sync
            if (!db.objectStoreNames.contains('quiz_results')) {
                const store = db.createObjectStore('quiz_results', { keyPath: 'local_id', autoIncrement: true })
                store.createIndex('synced', 'synced')
            }
            // Cached roadmaps
            if (!db.objectStoreNames.contains('roadmaps')) {
                db.createObjectStore('roadmaps', { keyPath: 'id' })
            }
            // Cached quizzes for offline use
            if (!db.objectStoreNames.contains('quizzes')) {
                db.createObjectStore('quizzes', { keyPath: 'id' })
            }
            // User progress
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'key' })
            }
        }
    })
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────
export async function saveQuizResultOffline(result) {
    const db = await getDB()
    return db.add('quiz_results', { ...result, synced: false, completed_at: new Date().toISOString() })
}

export async function getUnsyncedQuizResults() {
    const db = await getDB()
    return db.getAllFromIndex('quiz_results', 'synced', false)
}

export async function markQuizResultSynced(local_id) {
    const db = await getDB()
    const result = await db.get('quiz_results', local_id)
    if (result) {
        result.synced = true
        await db.put('quiz_results', result)
    }
}

// ─── Roadmaps ─────────────────────────────────────────────────────────────────
export async function saveRoadmapOffline(roadmap) {
    const db = await getDB()
    return db.put('roadmaps', { ...roadmap, cached_at: new Date().toISOString() })
}

export async function getRoadmapOffline(id) {
    const db = await getDB()
    return db.get('roadmaps', id)
}

export async function getAllRoadmapsOffline() {
    const db = await getDB()
    return db.getAll('roadmaps')
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export async function saveQuizOffline(quiz) {
    const db = await getDB()
    return db.put('quizzes', { ...quiz, cached_at: new Date().toISOString() })
}

export async function getQuizOffline(id) {
    const db = await getDB()
    return db.get('quizzes', id)
}

export async function getAllQuizzesOffline() {
    const db = await getDB()
    return db.getAll('quizzes')
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export async function saveProgress(key, value) {
    const db = await getDB()
    return db.put('progress', { key, value, updated_at: new Date().toISOString() })
}

export async function getProgress(key) {
    const db = await getDB()
    const item = await db.get('progress', key)
    return item?.value
}

// ─── Sync Manager ─────────────────────────────────────────────────────────────
export async function syncOfflineData(quizAPI) {
    try {
        const unsynced = await getUnsyncedQuizResults()
        if (unsynced.length === 0) return { synced: 0 }

        const response = await quizAPI.syncOffline(unsynced)
        const syncedIds = response.data?.synced_ids || []

        for (const result of unsynced) {
            await markQuizResultSynced(result.local_id)
        }

        return { synced: syncedIds.length }
    } catch (err) {
        console.warn('Sync failed, will retry when online:', err.message)
        return { synced: 0, error: err.message }
    }
}
