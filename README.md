# Coconut

Coconut is a simple, warm-toned to-do list for capturing tasks and tracking what
you've finished. Add tasks, click a task to mark it done or not done, drag tasks
by the handle to reorder them, and delete tasks after confirming. Your tasks and
completion status are saved in your browser, so they remain after a refresh.
Storage is local to that browser and does not sync between devices.

## Clone and run the app

You'll need [Git](https://git-scm.com/) and [Node.js with npm](https://nodejs.org/).

1. Clone the repository:

   ```bash
   git clone https://github.com/HasNas03/to-do-list.git
   ```

2. Change into the project directory:

   ```bash
   cd to-do-list
   ```

3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using Coconut

- Enter a task in the input and select **Add task** (or press Enter).
- Click anywhere on a task to mark it complete or incomplete. The progress bar
  shows how many tasks are complete.
- Drag a task using the handle on its right side to change its position. You can
  also focus the handle and use the up and down arrow keys.
- Select **Delete** and confirm to remove a task.
- Refresh the page; tasks are saved in the current browser.

## Other commands

Run the tests:

```bash
npm test -- --watchAll=false
```

Create an optimized production build in the `build` directory:

```bash
npm run build
```
