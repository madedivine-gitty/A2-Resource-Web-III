// $(document).ready(function() {
    $(function () {
        $(".drop").click(function(e){
            e.preventDefault();
            //$(this).next(".dropDown").slideToggle();
            if( $(this).next(".dropDown").is(":hidden")){
                $(".dropDown").slideUp(200)
                $(this).next(".dropDown").slideDown(200);
            }
            else{
                $(".dropDown").slideUp(200)
            }
        });

        $(".drop").focusout(function(){
            $(".dropDown").slideUp()
        })
    });
//});
var originalOrder = [];
var activeFilters = [];

//COLLAPSIBLE MENUS
document.addEventListener("DOMContentLoaded", function () {
    //waits for full HTML page to load before triggering function
 
    //select everything with collapsible class
     var collapsibles = document.querySelectorAll(".collapsible");
 
     //adds a click function to the collapsibles
     collapsibles.forEach(function (collapsible) {
         collapsible.addEventListener("click", function () {
             this.classList.toggle("active"); // if clicked, gives collapsible active class
            
             var content = this.nextElementSibling; // selects content to be expanded
             var maxVisibleHeight = window.innerHeight * 0.30; // about 30vh, roughly 30% of the navBAR height
 
             if (this.classList.contains("active")) {
                 content.classList.add("open");
                 content.style.maxHeight = Math.min(content.scrollHeight, maxVisibleHeight) + "px";
                 content.style.marginBottom = "15px";
             } else {
                 content.classList.remove("open");
                 content.style.maxHeight = 0;
                 content.style.marginBottom = "0";
             }
         });
     });
 });

//INTERACTIVE MAP
    $(document).ready(function() {
    const svg = $('svg');
    const worldMap = $('.world-map');
    const mapContainer = $('.map-container');
    const zoomInButton = $('.zoom-in');
    const zoomOutButton = $('.zoom-out');
    const zoomValueOutput = $('.zoom-value');

    let scale = 1.5;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function getTranslateBounds() {
        // Get the container dimensions (the world-map div)
        const containerWidth = worldMap.width();
        const containerHeight = worldMap.height();
        
        // Get the SVG's rendered dimensions
        const svgWidth = svg.width();
        const svgHeight = svg.height();
        
        // With center-based transform-origin and scaling from center,
        // calculate how much the content expands on each side
        const expandX = (scale - 1) * svgWidth / 2;
        const expandY = (scale - 1) * svgHeight / 2;
        
        // Reduce bounds by 20% symmetrically (multiply by 0.8)
        const reductionFactor = 0.7;
        
        // Max/min translate allows dragging to show expanded content within reduced bounds
        const maxTranslateX = expandX * reductionFactor;
        const minTranslateX = -expandX * reductionFactor;
        
        const maxTranslateY = expandY * reductionFactor;
        const minTranslateY = -expandY * reductionFactor;
        
        return {
            minTranslateX,
            maxTranslateX,
            minTranslateY,
            maxTranslateY,
        };
    }

    function applyTransform() {
        const bounds = getTranslateBounds();
        translateX = clamp(translateX, bounds.minTranslateX, bounds.maxTranslateX);
        translateY = clamp(translateY, bounds.minTranslateY, bounds.maxTranslateY);
        svg.css('transform', `scale(${scale}) translate(${translateX}px, ${translateY}px)`);
        zoomValueOutput.text(Math.round(scale * 100) + '%');
    }

    // Zoom with mouse wheel
    svg.on('wheel', function(e) {
        e.preventDefault();
        const delta = e.originalEvent.deltaY > 0 ? -0.1 : 0.1;
        scale += delta;
        scale = Math.max(1.5, Math.min(7, scale)); // Limit scale between 0.1 and 5
        applyTransform();
    });

    // Pan with left-click drag
    svg.on('mousedown', function(e) {
        if (e.which === 1) { // Left mouse button
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svg.css('cursor', 'grabbing');
        }
    });

    $(document).on('mousemove', function(e) {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            applyTransform();
        }
    });

    $(document).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            svg.css('cursor', 'grab');
        }
    });

    // Button zoom (existing functionality)
    zoomOutButton.prop('disabled', true);

    zoomInButton.on('click', function() {
        zoomOutButton.prop('disabled', false);
        scale += 1;
        if (scale >= 7) {
            zoomInButton.prop('disabled', true);
        }
        applyTransform();
    });

    zoomOutButton.on('click', function() {
        zoomInButton.prop('disabled', false);
        scale -= 1;
        if (scale <= 1.5) {
            zoomOutButton.prop('disabled', true);
        }
        applyTransform();
    });

    // Initial setup
    svg.css('cursor', 'grab');
    applyTransform();
    });
    
    // Country highlight support for filter buttons
    const countryPathMap = {};

    function slugifyText(value) {
        return value
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/&/g, 'and')
            .replace(/['’`.,()]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function buildCountryPathMap() {
        const svgElement = document.querySelector('.world-map svg');
        if (!svgElement) {
            return;
        }

        svgElement.querySelectorAll('path').forEach(function(path) {
            const values = [];
            if (path.id) {
                values.push(path.id);
            }
            if (path.getAttribute('name')) {
                values.push(path.getAttribute('name'));
            }
            if (path.classList && path.classList.length) {
                Array.from(path.classList).forEach(function(className) {
                    values.push(className);
                });
            }
            if (path.id === 'DRC') {
                values.push('Congo Democratic Republic');
            }

            values.forEach(function(value) {
                const key = slugifyText(value);
                if (!key) {
                    return;
                }
                if (!countryPathMap[key]) {
                    countryPathMap[key] = [];
                }
                countryPathMap[key].push(path);
            });
        });
    }

    buildCountryPathMap();

    function clearCountryHighlight() {
        document.querySelectorAll('.world-map svg path.highlighted').forEach(function(path) {
            path.classList.remove('highlighted');
        });
        document.querySelectorAll('.filterOption.button.active').forEach(function(button) {
            button.classList.remove('active');
        });
    }
// SHOWS GRAPHIC DESIGN CATALOGUE ON CLICK
    function normalizeFilterKey(value) {
        return value
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    function matchFilterDiv(filterKey, filterDiv) {
        const normalizedKey = normalizeFilterKey(filterKey);
        return Array.from(filterDiv.classList).some(function(className) {
            return normalizeFilterKey(className) === normalizedKey;
        });
    }

    function showMatchedFilterItems(filterKey) {
        document.querySelectorAll('.filterDiv').forEach(function(item) {
            if (matchFilterDiv(filterKey, item)) {
                item.classList.add('visible');
            } else {
                item.classList.remove('visible');
            }
        });
    }

    function hideAllFilterItems() {
        document.querySelectorAll('.filterDiv.visible').forEach(function(item) {
            item.classList.remove('visible');
        });
    }


// HIGHLIGHT COUNTRIES ON CLICK
    function findCountryPaths(filterKey) {
        const key = slugifyText(filterKey);
        return countryPathMap[key] || [];
    }

    window.filterGenre = function(event) {
        const button = event.currentTarget || event.target.closest('button');
        if (!button || !button.dataset.filter) {
            return;
        }

        const filterKey = button.dataset.filter;
        const selectedPaths = findCountryPaths(filterKey);
        const wasActive = button.classList.contains('active');

        clearCountryHighlight();
        hideAllFilterItems();

        if (wasActive) {
            return;
        }

        showMatchedFilterItems(filterKey);

        if (selectedPaths.length) {
            selectedPaths.forEach(function(path) {
                path.classList.add('highlighted');
            });
        }

        button.classList.add('active');
    };

// POP UP INFORMATION ON CLICK
    $(document).ready(function(){
        var currentlyVisibleBox = null; // Track which info box is currently visible
        
        $(".filterDiv").click(function(){
            // Get all classes from the clicked filterDiv
            var classes = $(this).attr('class').split(/\s+/);
            
            // Map of filterDiv class to info box class
            var infoBoxMap = {
                'drummagazine': 'Drum-Magazine-Info',
                'shakara': 'Shakara-Info',
                'fearnotman': 'Fear-Not-Man-Info',
                'divinechocolate': 'Divine-Chocolate-Info',
                'kofiantubam': 'Kofi-Antubam-Info'
            };
            
            // Find which info box to show based on filterDiv classes
            var infoBoxToShow = null;
            for (var i = 0; i < classes.length; i++) {
                if (infoBoxMap[classes[i]]) {
                    infoBoxToShow = '.' + infoBoxMap[classes[i]];
                    break;
                }
            }
            
            // Toggle functionality: if clicking the same box again, close it
            if (currentlyVisibleBox === infoBoxToShow && $(infoBoxToShow).is(':visible')) {
                $(infoBoxToShow).hide();
                currentlyVisibleBox = null;
                return;
            }
            
            // Hide all info boxes first
            $(".hide").hide();
            
            // Show only the matching info box
            if (infoBoxToShow) {
                $(infoBoxToShow).show();
                currentlyVisibleBox = infoBoxToShow;
            }
        });
    });

    $(document).ready(function(){
        // Close button works on all info boxes using class selector
        $(document).on("click", "button.closeBtn", function(){
            $(this).closest(".hide").hide();
        });
    });