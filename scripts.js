document.addEventListener('DOMContentLoaded', () => {

    // --- MANEJO DEL TEMA (MODO OSCURO / CLARO) ---
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    // Cargar tema guardado o preferencia del sistema
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    // --- MENÚ MÓVIL COLAPSIBLE ---
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // --- SCROLLSPY (ACTUALIZAR NAVEGACIÓN ACTIVA) ---
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // --- BUSCADOR GLOBAL EN TIEMPO REAL ---
    const searchInput = document.getElementById('searchInput');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const searchableItems = document.querySelectorAll('[data-search]');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            if (query === '') {
                searchableItems.forEach(item => {
                    item.style.display = '';
                });
                if (searchResultsInfo) searchResultsInfo.textContent = '';
                return;
            }

            searchableItems.forEach(item => {
                const searchData = item.getAttribute('data-search').toLowerCase();
                const title = (item.querySelector('h3') || item.querySelector('h4') || item);
                const titleText = title ? title.textContent.toLowerCase() : '';

                if (searchData.includes(query) || titleText.includes(query)) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (searchResultsInfo) {
                if (visibleCount === 0) {
                    searchResultsInfo.textContent = `Sin resultados para "${query}"`;
                } else {
                    searchResultsInfo.textContent = `${visibleCount} resultado${visibleCount !== 1 ? 's' : ''} encontrado${visibleCount !== 1 ? 's' : ''}`;
                }
            }
        });
    }

    // --- BOTONES "LEER MÁS / LEER MENOS" EN BITÁCORA ---
    const blogFeed = document.getElementById('blogFeed');

    if (blogFeed) {
        blogFeed.addEventListener('click', (e) => {
            const btn = e.target.closest('.read-more-btn');
            if (!btn) return;

            const post = btn.closest('.blog-post');
            if (!post) return;

            const isExpanded = post.classList.contains('expanded');
            post.classList.toggle('expanded');
            btn.textContent = isExpanded ? 'Leer más' : 'Leer menos';
        });
    }

    // --- FORMULARIO NUEVA ENTRADA DE BITÁCORA ---
    const newPostForm = document.getElementById('newPostForm');

    if (newPostForm) {
        newPostForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            const content = document.getElementById('postContent').value.trim();

            if (!title || !content) return;

            const today = new Date();
            const dateStr = today.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const badgeClass = {
                'Reflexión': 'badge-info',
                'Propuesta didáctica': 'badge-success',
                'Pregunta abierta': 'badge-warning'
            }[category] || 'badge-info';

            const postEl = document.createElement('article');
            postEl.className = 'blog-post';
            postEl.setAttribute('data-search', `${title.toLowerCase()} ${content.toLowerCase().substring(0, 100)}`);
            postEl.innerHTML = `
                <div class="blog-meta">
                    <span class="badge ${badgeClass}">${escapeHTML(category)}</span>
                    <span class="blog-date">
                        <svg class="icon" viewBox="0 0 24 24">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        ${dateStr}
                    </span>
                </div>
                <h3 class="blog-title">${escapeHTML(title)}</h3>
                <p class="blog-excerpt">${escapeHTML(content)}</p>
                <button class="btn btn-outline read-more-btn" style="display:none;">Leer más</button>
            `;

            postEl.style.opacity = '0';
            postEl.style.transform = 'translateY(20px)';
            postEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

            const feed = document.getElementById('blogFeed');
            if (feed) {
                feed.insertBefore(postEl, feed.firstChild);
                setTimeout(() => {
                    postEl.style.opacity = '1';
                    postEl.style.transform = 'translateY(0)';
                }, 50);

                postEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            newPostForm.reset();
            showToast('¡Tu reflexión fue publicada en la bitácora!', 'success');
        });
    }

    // --- MODALES DE DETALLE DE RECURSOS ---
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMeta = document.getElementById('modalMeta');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const modalSecondaryBtn = document.getElementById('modalSecondaryBtn');
    const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');

    const resourceDetails = {
        conectar: {
            title: 'Conectar Igualdad',
            meta: 'Portal Nacional · Ministerio de Educación Argentina',
            url: 'https://www.educ.ar/conectar-igualdad',
            body: 'Conectar Igualdad es una política pública de inclusión digital impulsada por el Ministerio de Educación de la Nación Argentina. Entrega netbooks a estudiantes y docentes de escuelas secundarias públicas, especiales y de formación docente. Su plataforma digital integra recursos pedagógicos curriculares, software educativo libre, tutoriales para docentes y secuencias didácticas alineadas a los NAP. Es una herramienta clave para el enfoque de igualdad de oportunidades en el acceso a la tecnología.'
        },
        eduteka: {
            title: 'Eduteka (edtk.co)',
            meta: 'Didáctica TIC · Universidad Icesi, Colombia',
            url: 'https://eduteka.icesi.edu.co',
            body: 'Eduteka es un portal de la Universidad Icesi de Colombia especializado en la integración curricular de las TIC en la educación K-12. Ofrece artículos especializados sobre pedagogía con tecnología, un generador de rúbricas analíticas en línea, matrices de valoración para proyectos digitales y guías ISTE para docentes. Es ideal para enfocar el diseño instruccional con estándares de calidad internacionales y alinear propuestas al marco SAMR.'
        },
        programar: {
            title: 'Iniciativa Program.AR',
            meta: 'Currícula Computación · Fundación Sadosky, Argentina',
            url: 'https://program.ar',
            body: 'Program.AR es la iniciativa de la Fundación Sadosky para llevar las Ciencias de la Computación a las aulas argentinas. Ofrece manuales gratuitos para docentes de primaria y secundaria, capacitaciones en servicio y una amplia variedad de secuencias didácticas que abordan algoritmos, redes, arquitectura de computadoras y pensamiento computacional desde una perspectiva constructivista. Sus materiales promueven el aprendizaje activo sin depender de un lenguaje de programación específico.'
        },
        codeorg: {
            title: 'Code.org',
            meta: 'Plataforma Educativa · Internacional',
            url: 'https://code.org',
            body: 'Code.org es una plataforma internacional sin fines de lucro dedicada a expandir el acceso a la educación en Ciencias de la Computación. Ofrece cursos estructurados por edades (desde Kindergarten hasta secundaria), lecciones con bloques de programación visual y actividades "unplugged" (desenchufadas) que no requieren computadoras. Su enfoque de gamificación y seguimiento autónomo lo hace ideal para introducir conceptos como bucles, condicionales y funciones de forma lúdica.'
        },
        scratch: {
            title: 'Scratch (MIT Media Lab)',
            meta: 'Software Educativo · MIT Media Lab',
            url: 'https://scratch.mit.edu',
            body: 'Scratch es un entorno de programación visual en bloques desarrollado por el MIT Media Lab. Permite a niños y jóvenes crear historias interactivas, animaciones y videojuegos de forma intuitiva. La comunidad global de Scratch permite compartir proyectos y recibir retroalimentación de pares. Su propuesta pedagógica se basa en el Espiral del Aprendizaje Creativo: Imaginar, Crear, Jugar, Compartir y Reflexionar, eliminando la frustración de la sintaxis para enfocarse en el pensamiento lógico.'
        },
        educar: {
            title: 'Portal Educ.ar',
            meta: 'Recursos Multimedia · Ministerio de Educación Argentina',
            url: 'https://www.educ.ar',
            body: 'Educ.ar es el portal educativo del Estado argentino, gestionado por el Ministerio de Educación de la Nación. Contiene contenidos digitales curriculares, episodios de Canal Encuentro y Paka Paka con guías pedagógicas, infografías, juegos educativos y cursos de formación continua gratuitos para docentes. Es especialmente valioso para trabajar historia de la tecnología, ciudadanía digital, ciberseguridad y soberanía digital con recursos audiovisuales de alta calidad didáctica.'
        }
    };

    const detailButtons = document.querySelectorAll('.detail-btn');

    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const details = resourceDetails[target];
            if (!details || !modalOverlay) return;

            if (modalTitle) modalTitle.textContent = details.title;
            if (modalMeta) modalMeta.textContent = details.meta;
            if (modalBody) modalBody.textContent = details.body;
            if (modalPrimaryBtn) modalPrimaryBtn.href = details.url;

            modalOverlay.classList.add('active');
        });
    });

    // Cerrar modal
    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('active');
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalSecondaryBtn) modalSecondaryBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Tecla Escape cierra el modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // --- FORMULARIO DE CONTACTO PLN ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Animación de carga
            submitBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Enviando...
            `;
            submitBtn.disabled = true;

            setTimeout(() => {
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showToast('¡Mensaje enviado con éxito! Te contactaré pronto.', 'success');
            }, 1500);
        });
    }

    // --- FUNCIÓN UTILITARIA: MOSTRAR TOAST ---
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;

        // Icono según tipo
        const iconSVG = type === 'success'
            ? `<svg class="icon" viewBox="0 0 24 24" style="color: var(--success)"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="icon" viewBox="0 0 24 24" style="color: #ef4444"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;

        toast.innerHTML = `${iconSVG}<span>${escapeHTML(message)}</span>`;
        toastContainer.appendChild(toast);

        // Remover toast después de 4 segundos
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- FUNCIÓN UTILITARIA: ESCAPE HTML ---
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- ANIMACIÓN CSS PARA SPINNER ---
    const styleEl = document.createElement('style');
    styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleEl);

});
