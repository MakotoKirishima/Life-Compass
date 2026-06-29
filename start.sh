#!/bin/bash
echo "=== Life Compass Startup ==="

pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

echo "Starting backend on port 8000..."
cd /home/debian/Projects/life-compass/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BGPID=$!
sleep 3

node -e "http=require('http');http.get({host:'127.0.0.1',port:8000,path:'/api/health',timeout:3000},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('Backend:',d);});}).on('error',e=>console.log('Backend Error:',e.message));"

echo "Starting frontend on port 3000..."
cd /home/debian/Projects/life-compass/frontend
npx next dev -p 3000 &
sleep 4

node -e "http=require('http');http.get({host:'127.0.0.1',port:3000,path:'/',timeout:5000},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('Frontend: online ('+d.length+' bytes)');});}).on('error',e=>console.log('Frontend Error:',e.message));"

echo ""
echo "=== Life Compass is running ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/api/health"
echo ""

wait
