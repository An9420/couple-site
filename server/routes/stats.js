import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [coupleRows] = await pool.query('SELECT start_date FROM couple_info WHERE id = 1')
    const startDate = coupleRows.length ? new Date(coupleRows[0].start_date) : new Date('2023-06-29')
    const totalDays = Math.floor((Date.now() - startDate.getTime()) / 86400000)

    const [[{ diaryCount }]] = await pool.query('SELECT COUNT(*) as diaryCount FROM diaries')
    const [[{ photoCount }]] = await pool.query('SELECT COUNT(*) as photoCount FROM media WHERE type = "image"')
    const [[{ videoCount }]] = await pool.query('SELECT COUNT(*) as videoCount FROM media WHERE type = "video"')
    const [[{ footprintCount }]] = await pool.query('SELECT COUNT(*) as footprintCount FROM footprints')
    const [[{ bucketTotal }]] = await pool.query('SELECT COUNT(*) as bucketTotal FROM bucketlist')
    const [[{ bucketDone }]] = await pool.query('SELECT COUNT(*) as bucketDone FROM bucketlist WHERE completed = 1')
    const [[{ firsttimesCount }]] = await pool.query('SELECT COUNT(*) as firsttimesCount FROM firsttimes')
    const [[{ taskTotal }]] = await pool.query('SELECT COUNT(*) as taskTotal FROM tasks')
    const [[{ taskDone }]] = await pool.query('SELECT COUNT(*) as taskDone FROM tasks WHERE status = "done"')
    const [[{ totalCheckins }]] = await pool.query('SELECT COUNT(*) as totalCheckins FROM checkins')

    const checkinRate = totalDays > 0 ? Math.round((totalCheckins / totalDays) * 100) : 0

    // Mood distribution
    const [moodRows] = await pool.query('SELECT mood, COUNT(*) as cnt FROM diaries GROUP BY mood ORDER BY cnt DESC LIMIT 6')

    res.json({
      totalDays,
      diaryCount,
      photoCount,
      videoCount,
      totalMedia: photoCount + videoCount,
      footprintCount,
      bucketTotal,
      bucketDone,
      bucketPercent: bucketTotal > 0 ? Math.round((bucketDone / bucketTotal) * 100) : 0,
      firsttimesCount,
      taskTotal,
      taskDone,
      totalCheckins,
      checkinRate,
      moodDistribution: moodRows,
      startDate: startDate.toISOString().slice(0, 10)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
