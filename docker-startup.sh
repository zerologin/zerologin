#!/bin/bash
echo "Docker startup: migrate database"
cd build
npm run migrate
echo "Docker startup: migration complete"
echo "Docker startup: Launching zerologin"
node server.js