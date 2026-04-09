#!/usr/bin/env node

import { MrrmMcpServer } from './mcp-server.js';

const server = new MrrmMcpServer();
server.start();