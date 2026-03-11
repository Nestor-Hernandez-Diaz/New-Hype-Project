// ============================================
// NewHype ERP API Documentation - App Logic
// ============================================

(function () {
    'use strict';

    // DOM elements
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebarNav');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const searchInput = document.getElementById('searchInput');
    const contentEl = document.getElementById('content');
    const welcomePage = document.getElementById('welcomePage');
    const endpointPage = document.getElementById('endpointPage');
    const modulePage = document.getElementById('modulePage');

    // SVG icons
    const chevronSVG = '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

    // ============ INITIALIZATION ============
    function init() {
        renderSidebar();
        renderWelcomeCounts();
        setupEventListeners();
        handleHashChange();
    }

    // ============ SIDEBAR RENDERING ============
    function renderSidebar(filter) {
        const filterLower = filter ? filter.toLowerCase() : '';
        let html = '';

        for (const [envKey, env] of Object.entries(API_DATA.environments)) {
            const modules = env.modules;
            let moduleHtml = '';
            let totalEndpoints = 0;
            let hasMatch = false;

            for (const [modKey, mod] of Object.entries(modules)) {
                const endpoints = mod.endpoints;
                let endpointHtml = '';
                let modMatch = false;

                for (let i = 0; i < endpoints.length; i++) {
                    const ep = endpoints[i];
                    const matchesFilter = !filterLower ||
                        ep.summary.toLowerCase().includes(filterLower) ||
                        ep.path.toLowerCase().includes(filterLower) ||
                        ep.method.toLowerCase().includes(filterLower);

                    if (matchesFilter) {
                        modMatch = true;
                        hasMatch = true;
                        endpointHtml += `<a class="nav-endpoint" data-env="${envKey}" data-mod="${modKey}" data-idx="${i}" href="#${envKey}/${modKey}/${i}">
                            <span class="method-badge ${ep.method.toLowerCase()}">${ep.method}</span>
                            <span class="endpoint-text">${ep.summary}</span>
                        </a>`;
                    }
                }

                if (!filterLower || modMatch) {
                    totalEndpoints += endpoints.length;
                    const collapsed = filterLower ? '' : 'collapsed';
                    moduleHtml += `<div class="nav-module">
                        <div class="nav-module-header ${collapsed}" data-env="${envKey}" data-mod="${modKey}">
                            ${chevronSVG}
                            <span class="module-name">${mod.name}</span>
                            <span class="endpoint-count">${endpoints.length}</span>
                        </div>
                        <div class="nav-endpoints ${collapsed}">${endpointHtml}</div>
                    </div>`;
                }
            }

            if (!filterLower || hasMatch) {
                html += `<div class="nav-env">
                    <div class="nav-env-header" data-env="${envKey}">
                        ${env.name}
                        ${chevronSVG}
                    </div>
                    <div class="nav-env-modules">${moduleHtml}</div>
                </div>`;
            }
        }

        if (!html) {
            html = `<div class="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <p>No se encontraron endpoints</p>
            </div>`;
        }

        sidebarNav.innerHTML = html;
        setupSidebarInteractions();
    }

    function setupSidebarInteractions() {
        // Environment header toggle
        sidebarNav.querySelectorAll('.nav-env-header').forEach(function (header) {
            header.addEventListener('click', function () {
                this.classList.toggle('collapsed');
                const modules = this.nextElementSibling;
                if (modules) modules.classList.toggle('collapsed');
            });
        });

        // Module header toggle
        sidebarNav.querySelectorAll('.nav-module-header').forEach(function (header) {
            header.addEventListener('click', function () {
                this.classList.toggle('collapsed');
                const endpoints = this.nextElementSibling;
                if (endpoints) endpoints.classList.toggle('collapsed');
            });
        });

        // Endpoint click
        sidebarNav.querySelectorAll('.nav-endpoint').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                const env = this.dataset.env;
                const mod = this.dataset.mod;
                const idx = this.dataset.idx;
                window.location.hash = `${env}/${mod}/${idx}`;
                closeMobileMenu();
            });
        });

        // Highlight current active
        updateActiveNav();
    }

    function updateActiveNav() {
        const hash = window.location.hash.slice(1);
        sidebarNav.querySelectorAll('.nav-endpoint').forEach(function (el) {
            const href = el.getAttribute('href').slice(1);
            el.classList.toggle('active', href === hash);
        });

        sidebarNav.querySelectorAll('.nav-module-header').forEach(function (el) {
            const env = el.dataset.env;
            const mod = el.dataset.mod;
            el.classList.toggle('active', hash.startsWith(env + '/' + mod));
        });
    }

    // ============ WELCOME PAGE ============
    function renderWelcomeCounts() {
        for (const [envKey, env] of Object.entries(API_DATA.environments)) {
            let count = 0;
            for (const mod of Object.values(env.modules)) {
                count += mod.endpoints.length;
            }
            const el = document.getElementById('count' + envKey.charAt(0).toUpperCase() + envKey.slice(1));
            if (el) el.textContent = count + ' endpoints';
        }
    }

    // ============ PAGE ROUTING ============
    function handleHashChange() {
        const hash = window.location.hash.slice(1);

        if (!hash) {
            showWelcome();
            return;
        }

        const parts = hash.split('/');

        if (parts.length === 2) {
            // Module page
            showModule(parts[0], parts[1]);
        } else if (parts.length === 3) {
            // Endpoint detail page
            showEndpoint(parts[0], parts[1], parseInt(parts[2]));
        } else {
            showWelcome();
        }

        updateActiveNav();
    }

    function showWelcome() {
        welcomePage.style.display = '';
        endpointPage.style.display = 'none';
        modulePage.style.display = 'none';
    }

    // ============ MODULE PAGE ============
    function showModule(envKey, modKey) {
        const env = API_DATA.environments[envKey];
        if (!env) { showWelcome(); return; }
        const mod = env.modules[modKey];
        if (!mod) { showWelcome(); return; }

        welcomePage.style.display = 'none';
        endpointPage.style.display = 'none';
        modulePage.style.display = '';

        let endpointListHtml = '';
        mod.endpoints.forEach(function (ep, i) {
            endpointListHtml += `<div class="endpoint-list-item" data-env="${envKey}" data-mod="${modKey}" data-idx="${i}">
                <span class="method-badge-lg ${ep.method.toLowerCase()}">${ep.method}</span>
                <div class="endpoint-info">
                    <div class="endpoint-path">${ep.path}</div>
                    <div class="endpoint-summary">${ep.summary}</div>
                </div>
            </div>`;
        });

        modulePage.innerHTML = `<div class="module-header">
            <div class="breadcrumb"><a href="#" class="nav-home">Inicio</a> / <a href="#" class="nav-home">${env.name}</a> / ${mod.name}</div>
            <h1>${mod.name}</h1>
            <p>${mod.description}</p>
        </div>
        <h2>Endpoints (${mod.endpoints.length})</h2>
        ${endpointListHtml}`;

        // Endpoint click handlers
        modulePage.querySelectorAll('.endpoint-list-item').forEach(function (el) {
            el.addEventListener('click', function () {
                window.location.hash = this.dataset.env + '/' + this.dataset.mod + '/' + this.dataset.idx;
            });
        });

        // Home link handler
        modulePage.querySelectorAll('.nav-home').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = '';
            });
        });

        // Expand in sidebar
        expandSidebarTo(envKey, modKey);
        window.scrollTo(0, 0);
    }

    // ============ ENDPOINT DETAIL PAGE ============
    function showEndpoint(envKey, modKey, idx) {
        const env = API_DATA.environments[envKey];
        if (!env) { showWelcome(); return; }
        const mod = env.modules[modKey];
        if (!mod) { showWelcome(); return; }
        const ep = mod.endpoints[idx];
        if (!ep) { showWelcome(); return; }

        welcomePage.style.display = 'none';
        modulePage.style.display = 'none';
        endpointPage.style.display = '';

        const methodLower = ep.method.toLowerCase();
        const fullUrl = API_DATA.info.baseUrl + ep.path;

        let html = `<div class="endpoint-detail">
            <div class="breadcrumb">
                <a class="nav-home" href="#">Inicio</a> / 
                <a class="nav-env-link" href="#" data-env="${envKey}">${env.name}</a> / 
                <a class="nav-mod-link" href="#${envKey}/${modKey}">${mod.name}</a> / 
                ${ep.summary}
            </div>

            <div class="endpoint-title-row">
                <span class="method-badge-xl ${methodLower}">${ep.method}</span>
                <h1>${ep.summary}</h1>
            </div>

            <div class="endpoint-path-display">
                <span>${fullUrl}</span>
                <button class="copy-btn" data-url="${escapeAttr(fullUrl)}">Copiar</button>
            </div>

            <p class="endpoint-description">${ep.description || ''}</p>`;

        // Parameters
        if (ep.parameters && ep.parameters.length > 0) {
            html += `<h3 class="section-title">Parámetros</h3>
            <table class="params-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Tipo</th>
                        <th>Requerido</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>`;
            ep.parameters.forEach(function (p) {
                const reqClass = p.required ? 'required' : 'optional';
                const reqText = p.required ? 'Sí' : 'No';
                html += `<tr>
                    <td><span class="param-name">${p.name}</span></td>
                    <td><span class="param-in">${p.in}</span></td>
                    <td><span class="param-type">${p.type}</span></td>
                    <td><span class="param-required ${reqClass}">${reqText}</span></td>
                    <td>${p.description || '-'}</td>
                </tr>`;
            });
            html += '</tbody></table>';
        }

        // Request Body
        if (ep.requestBody) {
            html += `<h3 class="section-title">Request Body</h3>`;
            html += `<div class="request-body-info"><span class="schema-name">${ep.requestBody.type}</span></div>`;

            if (ep.requestBody.properties) {
                html += `<table class="params-table">
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Tipo</th>
                            <th>Requerido</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>`;
                for (const [propName, prop] of Object.entries(ep.requestBody.properties)) {
                    const reqClass = prop.required ? 'required' : 'optional';
                    const reqText = prop.required ? 'Sí' : 'No';
                    html += `<tr>
                        <td><span class="param-name">${propName}</span></td>
                        <td><span class="param-type">${prop.type}</span></td>
                        <td><span class="param-required ${reqClass}">${reqText}</span></td>
                        <td>${prop.description || '-'}</td>
                    </tr>`;
                }
                html += '</tbody></table>';

                // Example JSON
                html += renderExampleJson(ep.requestBody.properties);
            }
        }

        // Responses
        if (ep.responses) {
            html += `<h3 class="section-title">Respuestas</h3>`;
            for (const [code, resp] of Object.entries(ep.responses)) {
                html += `<div class="response-status">
                    <span class="status-code">${code}</span>
                    <span class="status-text">${resp.description}</span>
                </div>`;
                if (resp.schema) {
                    html += `<p style="margin-top:8px;font-size:0.85rem;color:var(--color-text-secondary)">Schema: <code class="base-url" style="font-size:0.8rem">${resp.schema}</code></p>`;
                }
            }

            // Standard response format example
            html += renderStandardResponse();
        }

        html += '</div>';

        endpointPage.innerHTML = html;

        // Event handlers for breadcrumb
        endpointPage.querySelectorAll('.nav-home').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = '';
            });
        });
        endpointPage.querySelectorAll('.nav-env-link').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = '';
            });
        });

        // Copy button
        endpointPage.querySelectorAll('.copy-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const url = this.dataset.url;
                copyToClipboard(url);
                this.textContent = '¡Copiado!';
                var self = this;
                setTimeout(function () { self.textContent = 'Copiar'; }, 1500);
            });
        });

        // Copy code buttons
        endpointPage.querySelectorAll('.copy-code-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const block = this.closest('.code-block');
                const code = block.querySelector('code').textContent;
                copyToClipboard(code);
                this.textContent = '¡Copiado!';
                var self = this;
                setTimeout(function () { self.textContent = 'Copiar'; }, 1500);
            });
        });

        expandSidebarTo(envKey, modKey);
        window.scrollTo(0, 0);
    }

    // ============ HELPERS ============
    function renderExampleJson(properties) {
        const example = {};
        for (const [key, prop] of Object.entries(properties)) {
            if (prop.type === 'string' || prop.type.startsWith('string')) {
                example[key] = prop.description || key;
            } else if (prop.type === 'integer' || prop.type.startsWith('integer')) {
                example[key] = 1;
            } else if (prop.type === 'number') {
                example[key] = 0.0;
            } else if (prop.type === 'boolean') {
                example[key] = true;
            } else if (prop.type === 'array') {
                example[key] = [];
            } else {
                example[key] = prop.description || key;
            }
        }

        const jsonStr = syntaxHighlight(JSON.stringify(example, null, 2));

        return `<div class="code-block">
            <div class="code-block-header">
                <span>Ejemplo Request Body</span>
                <button class="copy-code-btn">Copiar</button>
            </div>
            <pre><code>${jsonStr}</code></pre>
        </div>`;
    }

    function renderStandardResponse() {
        const example = {
            success: true,
            message: "Operación exitosa",
            data: "{ ... }",
            pagination: {
                page: 0,
                size: 20,
                totalElements: 100,
                totalPages: 5
            }
        };
        const jsonStr = syntaxHighlight(JSON.stringify(example, null, 2));

        return `<div class="code-block" style="margin-top:12px;">
            <div class="code-block-header">
                <span>Formato de Respuesta Estándar</span>
                <button class="copy-code-btn">Copiar</button>
            </div>
            <pre><code>${jsonStr}</code></pre>
        </div>`;
    }

    function syntaxHighlight(json) {
        return json.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    function expandSidebarTo(envKey, modKey) {
        // Expand environment
        var envHeader = sidebarNav.querySelector('.nav-env-header[data-env="' + envKey + '"]');
        if (envHeader) {
            envHeader.classList.remove('collapsed');
            var modules = envHeader.nextElementSibling;
            if (modules) modules.classList.remove('collapsed');
        }

        // Expand module
        if (modKey) {
            var modHeader = sidebarNav.querySelector('.nav-module-header[data-env="' + envKey + '"][data-mod="' + modKey + '"]');
            if (modHeader) {
                modHeader.classList.remove('collapsed');
                var endpoints = modHeader.nextElementSibling;
                if (endpoints) endpoints.classList.remove('collapsed');
            }
        }
    }

    // ============ EVENTS ============
    function setupEventListeners() {
        // Hash change
        window.addEventListener('hashchange', handleHashChange);

        // Search
        searchInput.addEventListener('input', function () {
            renderSidebar(this.value.trim());
        });

        // Mobile menu
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('open');
        });

        sidebarOverlay.addEventListener('click', closeMobileMenu);

        // Env cards on welcome page
        document.querySelectorAll('.env-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var envKey = this.dataset.env;
                var env = API_DATA.environments[envKey];
                if (env) {
                    var firstModKey = Object.keys(env.modules)[0];
                    if (firstModKey) {
                        window.location.hash = envKey + '/' + firstModKey;
                    }
                }
            });
        });

        // Keyboard shortcut: focus search with Ctrl+K
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                renderSidebar();
                searchInput.blur();
            }
        });
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    // Start the app
    init();
})();
