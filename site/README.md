# Sheep Docs
The branch for Sheep's documentation and dashboard. Available [here]](https://sheep.greysdawn.com)

## Building Instructions
1. Fire up the bot first. The docs have IPC set up to receive stats and other important info
2. Uncomment the bottom line in `index.js` from the root folder, the `app.listen` one. That'll allow you to access the website at `localhost:8080` (feel free to change this as needed)
3. Run `npm run build` inside the root folder
4. Navigate to `localhost:8080` (or whatever port you've set) and check out what you've made

If you just want to build the docs without serving them, just `cd` into `/frontend` and use `npm run build` again

If you want to see changes made to `index.js` and don't need to rebuild the frontend, use `node index` to run that, or whatever other execution method you prefer

## Notes
- The bottom line of the index is commented out so it doesn't interfere with the rest of the websites we personally run. For local builds, it's safe to keep it uncommented, but pull requests should have it commented out
- The line above that in the index (`module.exports = app`) is for folks using something like vhost to run multiple sites at once. If you're doing that, then just adding a line for the docs should work out of the box
- The docs will re-fetches stats and commands from the bot every 10 minutes. If you're working on adding new commands to the bot, then you can either restart the website or wait for it to refresh in order to see the changes