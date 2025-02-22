const { Collection } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { timeNow } = require('./utils/helper')

const processJobs = (client, dir, stack = "") => {
  const files = fs.readdirSync(dir)

  // Find each file within the given directory
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory())
      return processJobs(client, path.join(dir, file), stack+file + "/")
    
    // Load the job file
    const job = require(path.join(dir, file))

    // Ensure some parameters are set
    if (!job.meta.name || !job.meta.interval || job.meta.enabled === undefined)
      return console.warn('Ignoring', file, 'as the meta data is invalid (requires "name", "interval" and "enabled").')
    
    // Add per-job caching
    job.cache = {
      ...job.cache || {}
    }

    // Add our job to our pool
    client.jobs.set(job.meta.name, job)

    // Remove from require cache
    delete require.cache[require.resolve(path.join(dir, file))]

    // Run our job
    if (!job.meta.enabled) {
      console.log(`[JOB]: "${job.meta.name}" is disabled, so will not be executed.`)
      return
    }

    setInterval(async () => {
      await job.run(client, job.cache)
      console.log(`[RUNNER]: [${timeNow()}] "${job.meta.name}" was executed.`)
    }, job.meta.interval)
    console.log(`[JOB]: Running the "${job.meta.name}" job.`)
  })
}

module.exports = (client) => {
  // Create our jobs set
  client.jobs = new Collection()
  processJobs(client, path.join(__dirname, 'jobs'))
}
