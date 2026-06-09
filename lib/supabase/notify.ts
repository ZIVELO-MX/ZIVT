import { createClient } from './client'

async function insertTaskNotification(
  type: 'task_created' | 'task_done',
  title: string,
  body: string,
): Promise<void> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) return

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
      })
  } catch {
    // Best-effort only: task mutations must not fail because notification insert failed.
  }
}

export async function notifyTaskCreated(taskTitle: string, creatorId: string): Promise<void> {
  void creatorId
  await insertTaskNotification(
    'task_created',
    'Tarea creada',
    `Se creo la tarea "${taskTitle}".`,
  )
}

export async function notifyTaskCompleted(taskTitle: string, completedById: string): Promise<void> {
  void completedById
  await insertTaskNotification(
    'task_done',
    'Tarea completada',
    `Se completo la tarea "${taskTitle}".`,
  )
}
