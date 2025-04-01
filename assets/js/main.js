/*========= Utility Functions =========*/

/**
 * Returns the current time as a formatted string (HH:MM:SS).
 *
 * @returns {string} The current time in HH:MM:SS format.
 */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Returns the current time zone as a string.
 *
 * @returns {string} The current time zone (e.g., "Asia/Colombo").
 */
function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Animates a count-up effect on an HTML element.
 *
 * @param {HTMLElement} element - The target HTML element to display the count.
 * @param {number} number - The target number to count up to.
 * @param {number} decimal - The number of decimal places to display.
 * @param {number} progress - The current progress of the animation (between 0 and 1).
 */
function CountUp(element, number, decimal, progress) {
  element.textContent = `${element.getAttribute("prefix")}${Number(
    (progress * number) / Math.pow(10, decimal)
  ).toLocaleString("en-US", {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  })}${element.getAttribute("suffix")}`;
  if (element.getAttribute("status") == "paused") {
    element.textContent = `${element.getAttribute("prefix")}${Number(
      (0.5 * number) / Math.pow(10, decimal)
    ).toLocaleString("en-US", {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    })}${element.getAttribute("suffix")}`;
    return;
  }
  if (progress < 1) {
    progress = Math.min(progress + 0.01, 1);
    setTimeout(() => {
      CountUp(element, number, decimal, progress);
    }, 200 * Math.pow(progress, 10));
  }
}

/**
 * Creates a periodic vertical scrolling effect for a list.
 *
 * @param {HTMLElement} list - The target list element (e.g., `<ul>` or `<ol>`) to apply the scrolling effect.
 */
function PeriodicListScroller(list) {
  const firstLi = list.querySelector("li");

  if (firstLi) {
    const duration = 2500;
    let index = 0;

    let lis = list.querySelectorAll("li");
    const clonedLi = firstLi.cloneNode(true);
    list.appendChild(clonedLi);
    lis = list.querySelectorAll("li");

    const lisCount = lis.length;

    setInterval(() => {
      if (index % lisCount == 0) {
        gsap.set(list, { scrollTop: 0 });
        index = 1;
      }

      gsap.to(list, { scrollTop: index * list.offsetHeight });
      index += 1;
    }, duration);
  }
}

/**
 * Creates an Intersection Observer callback for counting up numbers within elements.
 *
 * - Extracts numeric parts, prefixes, and suffixes from the element's text content.
 * - Sets up GSAP-based width and animation.
 * - Uses `CountUp` to animate the numeric value when the element becomes visible.
 *
 * @returns {IntersectionObserverCallback} A callback function for IntersectionObserver.
 */
function NumberCountUpCallback() {
  function extractNumberParts(text) {
    const regex = /^(\D*)(\d*\.?\d+)(\D*)$/;
    const match = text.match(regex);
    if (match) {
      return {
        prefix: match[1] || "",
        numericValue: match[2],
        suffix: match[3] || "",
      };
    }
    return null;
  }

  return (entries, observer) => {
    entries.forEach((entry) => {
      const targetElement = entry.target;

      gsap.set(targetElement, { width: `${targetElement.offsetWidth}px` });

      if (!targetElement.getAttribute("originalWholeNumber")) {
        const numberParts = extractNumberParts(targetElement.textContent);
        if (!numberParts) return;

        targetElement.setAttribute(
          "originalWholeNumber",
          numberParts.numericValue.replace(".", "")
        );
        targetElement.setAttribute("prefix", numberParts.prefix.trim() || "");
        targetElement.setAttribute("suffix", numberParts.suffix.trim() || "");

        const decimalPosition = numberParts.numericValue.indexOf(".");
        targetElement.setAttribute(
          "decimalPlaces",
          decimalPosition === -1
            ? "-1"
            : String(numberParts.numericValue.length - (decimalPosition + 1))
        );
      }

      const decimalPlaces =
        targetElement.getAttribute("decimalPlaces") === "-1"
          ? 0
          : Number(targetElement.getAttribute("decimalPlaces"));
      const wholeNumber = Number(
        targetElement.getAttribute("originalWholeNumber")
      );

      if (entry.isIntersecting) {
        CountUp(targetElement, wholeNumber, decimalPlaces, 0.5);
        observer.unobserve(entry.target);
      }
    });
  };
}


/**
 * Generates a list of distinct random integers between a specified range.
 * If the range is smaller than the required list length, all integers in the range are returned.
 *
 * @param {number} start - The start of the range (inclusive).
 * @param {number} end - The end of the range (inclusive).
 * @param {number} listLength - The number of random distinct integers to generate.
 * @returns {number[]} An array of distinct random integers.
 */
function generateDistinctRandomIntList(start, end, listLength) {
  const rangeSize = end - start + 1;

  if (rangeSize < listLength) {
    const allNumbersInRange = [];
    for (let i = start; i <= end; i++) {
      allNumbersInRange.push(i);
    }
    return allNumbersInRange;
  }

  const randomList = new Set();

  while (randomList.size < listLength) {
    const randomInt = Math.floor(Math.random() * rangeSize) + start;
    randomList.add(randomInt);
  }

  return [...randomList];
}


/*====== Event Listener for DOMContentLoaded ======*/
window.addEventListener("DOMContentLoaded", () => {

  /*====== Body Lenis Setup For Smooth Scroll ======*/
  const lenis = new Lenis({
    wrapper: document.body,
    content: document.documentElement,
    smooth: true,
  });

  lenis.stop()

  /*====== Fetch Header and Navigation Menu, Set Timezone, and Real-Time Clock ======*/
  const header = document.getElementById("header");
  if (header) {
    fetch("/xquiste-portfolio/components/header.html")
      .then((response) => response.text())
      .then((html) => {
        header.outerHTML = html;

        /*====== Timezone Setter for User Display ======*/
        const timezone = document.querySelector("#user-timezone");
        if (timezone) {
          timezone.innerHTML = getTimeZone();
        }

        /*====== Real-Time Clock Display Update ======*/
        const currentTimePlaceholder = document.querySelector("#user-time");
        if (currentTimePlaceholder) {
          currentTimePlaceholder.innerHTML = getCurrentTime();
          setInterval(() => {
            currentTimePlaceholder.innerHTML = getCurrentTime();
          }, 1000);
        }

        /*====== Navigation Menu Setup with Toggle ======*/
        const navigationMenu = document.getElementById("navigation-menu");
        if (navigationMenu) {
          fetch("/xquiste-portfolio/components/menu.html")
            .then((response) => response.text())
            .then((data) => {
              navigationMenu.outerHTML = data;
              const nav = document.querySelector("#navigation-menu");
              const toggleOpen = document.querySelector(
                "#menu-toggle-open img"
              );
              const toggleClose = document.querySelector(
                "#menu-toggle-close img"
              );
              const navigationToggle =
                document.querySelector(".navigation-toggle");

              gsap.registerPlugin(ScrollTrigger);

              /*====== Lenis Setup For Navigation List Smooth Scroll ======*/

              const navLenis = new Lenis({
                wrapper: document.querySelector("#navigation-menu > nav"),
                content: document.querySelector("#navigation-menu > nav > ul"),
                smooth: true,
              });

              document.querySelectorAll("#navigation-menu a").forEach(a => {
                a.addEventListener('click', () => {
                  lenis.start();
                  navigationToggle.classList.remove("opened");
                  navigationToggle.classList.add("closed");
                  gsap.set(document.body, { height: "auto", overflowY: "auto" });
                  gsap.to(nav, { height: "0" });

              lenis.on("scroll", ScrollTrigger.update);
              navLenis.on("scroll", ScrollTrigger.update);
                })
              })

              gsap.ticker.add((time) => {
                lenis.raf(time * 3000);
              });

              gsap.ticker.add((time) => {
                navLenis.raf(time * 3000);
              });

              gsap.ticker.lagSmoothing(0);


              const scrollTop = document.querySelector('footer#footer #scroll-top-btn');
              if(scrollTop){
                scrollTop.addEventListener('click', () => {lenis.scrollTo(0)})
              }

              if (toggleOpen) {
                toggleOpen.addEventListener("click", () => {
                  lenis.stop();
                  window.scrollTo({ top: "0vh", behavior: "smooth" });
                  navigationToggle.classList.remove("closed");
                  navigationToggle.classList.add("opened");
                  gsap.set(document.body, { overflowY: "hidden" });
                  gsap.to(nav, { height: "85vh" });
                });
              }

              if (toggleClose) {
                toggleClose.addEventListener("click", () => {
                  lenis.start();
                  navigationToggle.classList.remove("opened");
                  navigationToggle.classList.add("closed");
                  gsap.set(document.body, { height: "auto", overflowY: "auto" });
                  gsap.to(nav, { height: "0" });
                });
              }

              /*====== Sub Menu Setup with Toggle ======*/
              const toggles = nav.querySelectorAll(".submenu-toggle");
              const subMenus = nav.querySelectorAll("ul ul");

              subMenus.forEach((menu) => {
                gsap.set(menu, { willChange: "height" });
              });

              toggles.forEach((toggle) => {
                toggle.addEventListener("click", (event) => {
                  const toggleButton = event.target.closest(".submenu-toggle");

                  const innerList = event.target
                    .closest("li")
                    .querySelector("ul");
                  if (innerList) {
                    if (innerList.classList.contains("visible")) {
                      innerList.classList.remove("visible");
                      toggleButton.classList.remove("opened");
                      gsap.set(innerList, { height: innerList.scrollHeight });
                      gsap.to(innerList, {
                        height: 0,
                        marginTop: "0px",
                        opacity: 0,
                      });
                    } else {
                      innerList.classList.add("visible");
                      toggleButton.classList.add("opened");
                      gsap.to(innerList, {
                        height: innerList.scrollHeight,
                        marginTop: "20px",
                        opacity: 1,
                        onComplete: () => {
                          gsap.set(innerList, { height: "fit-content" });
                        },
                      });
                    }
                  }
                });
              });
            });
        }
      });
  }

  /*====== Fetch and Setup Footer ======*/
  const footer = document.getElementById("footer");
  if (footer) {
    fetch("/xquiste-portfolio/components/footer.html")
      .then((response) => response.text())
      .then((html) => {
        footer.outerHTML = html;
        const copyrightYearValue = document.querySelector("footer#footer #year")
        if(copyrightYearValue){
          copyrightYearValue.textContent = new Date().getFullYear();
        } 
      });
  }

  /*====== Setup Random Posts ======*/
  const randomPostsContainer = document.getElementById("random-posts");
  if (randomPostsContainer) {
    const randomPostsCount = Number(randomPostsContainer.getAttribute('data-random-posts-count') ?? 6);
    fetch("/xquiste-portfolio/components/random-posts.html")
      .then((response) => response.text())
      .then((html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const posts = tempDiv.querySelectorAll('a.card');
        console.log(posts)
        generateDistinctRandomIntList(0,posts.length - 1, randomPostsCount).forEach(index => {
          randomPostsContainer.appendChild(posts[index]);
        })


        
      });
  }

  /*====== Fetch and Setup Categories ======*/
  const categoryContainer = document.getElementById("categories-container");
  if (categoryContainer) {
    fetch("/xquiste-portfolio/components/categories.html")
      .then((response) => response.text())
      .then((html) => {
        categoryContainer.outerHTML = html;
      });
  }

  /*====== Fetch and Setup Tags ======*/
  const tagsContainer = document.getElementById("tags-container");
  if (tagsContainer) {
    fetch("/xquiste-portfolio/components/tags.html")
      .then((response) => response.text())
      .then((html) => {
        tagsContainer.outerHTML = html;
      });
  }

  /*====== Apply Periodic List Scrolling to Lists ======*/
  const lists = document.querySelectorAll(".list");
  lists.forEach((list) => {
    PeriodicListScroller(list);
  });

  /*====== Observe and Trigger Number Count-Up on Scroll ======*/
  const countUpNumbers = document.querySelectorAll(".count");
  const observer = new IntersectionObserver(NumberCountUpCallback(), {
    root: null,
    rootMargin: "0px",
    threshold: 0.01,
  });
  countUpNumbers.forEach((target) => observer.observe(target));

  /*====== Swipeable Cards Setup ======*/
  const swipeCards = document.querySelectorAll(".swipe-card");
  swipeCards.forEach((swipeCard) => {
    const imagesContainer = swipeCard.querySelector(".image-collection");
    const titlesContainer = swipeCard.querySelector(".title-collection");
    const descriptionsContainer = swipeCard.querySelector(
      ".description-collection"
    );
    const swipeInterval = swipeCard.getAttribute('data-swipe-interval');

    let images = Array.from(
      swipeCard.querySelectorAll(".image-collection .featured-image")
    );
    let titles = swipeCard.querySelectorAll(".title-collection .title");
    let descriptions = swipeCard.querySelectorAll(
      ".description-collection .description"
    );

    if (
      images.length === titles.length &&
      titles.length === descriptions.length
    ) {
      let index = 0;
      const totalCount = titles.length;
      const currentIndexElement = swipeCard.querySelector(
        ".index .current-index"
      );
      const indexCountElement = swipeCard.querySelector(".index .index-count");
      const leftSwipeButton = swipeCard.querySelector(".left-swipe-button");
      const rightSwipeButton = swipeCard.querySelector(".right-swipe-button");

      function setView(behavior) {
        if (imagesContainer)
          imagesContainer.scrollTo({
            left: imagesContainer.getBoundingClientRect().width * index,
            behavior: behavior,
          });
        if (descriptionsContainer)
          descriptionsContainer.scrollTo({
            top: descriptionsContainer.offsetHeight * index,
            behavior: behavior,
          });
        if (titlesContainer)
          titlesContainer.scrollTo({
            top: titlesContainer.offsetHeight * index,
            behavior: behavior,
          });
        if (currentIndexElement) currentIndexElement.innerText = index + 1;
      }

      if (indexCountElement) {
        indexCountElement.innerText = totalCount;
      }

      if (rightSwipeButton) {
        rightSwipeButton.addEventListener("click", () => {
          index = (index + 1) % totalCount;
          setView("smooth");
        });
      }

      if (leftSwipeButton) {
        leftSwipeButton.addEventListener("click", () => {
          index = index == 0 ? totalCount - 1 : index - 1;
          setView("smooth");
        });
      }

      const resizeObserver = new ResizeObserver((_) => {
        setView("instant");
      });

      resizeObserver.observe(imagesContainer);

      document.addEventListener("keydown", (event) => {
        const bottomY = swipeCard.getBoundingClientRect().bottom;
        if (bottomY > 0 && bottomY - window.innerHeight * 1.5 <= 0) {
          switch (event.key) {
            case "ArrowRight": {
              index = (index + 1) % totalCount;
              setView("smooth");
              break;
            }

            case "ArrowLeft": {
              index = index == 0 ? totalCount - 1 : index - 1;
              setView("smooth");
              break;
            }
          }
        }
      });
      
      if(!isNaN(parseFloat(swipeInterval))){
        setInterval(() => {
          index = (index + 1) % totalCount;
          setView("smooth");
        },parseFloat(swipeInterval) * 1000)
      }


    }
  });

  /*====== Card Scrollers Setup ======*/
  const cardsScrollers = document.querySelectorAll(".cards-scroller");
  cardsScrollers.forEach((scroller) => {
    let activeIndex = 0;
    const cards = Array.from(scroller.querySelectorAll(".card"));
    const cardIndexes = Array.from(scroller.querySelectorAll(".index"));
    const cardIndexesContainer = scroller.querySelector(".indexes");

    function setActiveIndex(activeIndex) {
      cardIndexes.forEach((card, index) => {
        if (index == activeIndex) {
          card.classList.add("index-active");
          cardIndexesContainer.scrollTo({
            left: cardIndexes
              .slice(0, activeIndex)
              .reduce((a, b) => a + b.getBoundingClientRect().width, 0),
            behavior: "smooth",
          });
        } else {
          card.classList.remove("index-active");
        }
      });
    }

    function onEnter(entries, observer) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (activeIndex != cards.length - 1) {
            activeIndex = cards.indexOf(entry.target);
            setActiveIndex(activeIndex);
          }
        } else {
          if (scroller.getBoundingClientRect().top <= 0) {
            activeIndex =
              cards.indexOf(entry.target) == 0
                ? 0
                : cards.indexOf(entry.target) - 1;
            setActiveIndex(activeIndex);
          }
        }
      });
    }

    const observer = new IntersectionObserver(onEnter, {
      root: null,
      threshold: 0.1,
    });

    cards.forEach((card) => observer.observe(card));

    setActiveIndex(0);
  });

  /*====== Service Plans Carousel Setup ======*/
  const services = document.querySelector("#services");

  if (services) {
    const plansContainers = services.querySelectorAll(".service-plans");
    plansContainers.forEach((plansContainer) => {
      let index = 0;
      const plans = plansContainer.querySelectorAll(".service-plan");
      const rightButtons = plansContainer.querySelectorAll(".switch-right-btn");
      const leftButtons = plansContainer.querySelectorAll(".switch-left-btn");

      function setView(behavior) {
        plansContainer.scrollTo({
          left: plansContainer.offsetWidth * index,
          behavior: behavior,
        });
      }

      rightButtons.forEach((button) => {
        button.addEventListener("click", () => {
          index = (index + 1) % plans.length;
          setView("smooth");
        });
      });

      leftButtons.forEach((button) => {
        button.addEventListener("click", () => {
          index = index == 0 ? plans.length - 1 : index - 1;
          setView("smooth");
        });
      });

      const resizeObserver = new ResizeObserver((_) => {
        setView("instant");
      });

      resizeObserver.observe(plansContainer);

      document.addEventListener("keydown", (event) => {
        const bottomY = plansContainer.getBoundingClientRect().bottom;
        if (bottomY > 0 && bottomY - window.innerHeight * 1.5 <= 0) {
          switch (event.key) {
            case "ArrowRight": {
              index = (index + 1) % plans.length;
              setView("smooth");
              break;
            }

            case "ArrowLeft": {
              index = index == 0 ? plans.length - 1 : index - 1;
              setView("smooth");
              break;
            }
          }
        }
      });
    });
  }

  /*====== Collection Pagination Setup ======*/

  const collectionElements = document.querySelectorAll(".paginated-articles");
  collectionElements.forEach((collectionElement) => {
    const container = collectionElement.closest(".content");

    /*====== Pagination Setup ======*/
    fetch(`/xquiste-portfolio/components/pagination.html`)
      .then((response) => response.text())
      .then((html) => {
        container.innerHTML += html;
        let pagination = 0;

        let paginationListElement = container.querySelector("#pagination ul");
        if (paginationListElement) {
          const nextButton = paginationListElement.querySelector(".next");
          const prevButton = paginationListElement.querySelector(".prev");

          const archive =
            collectionElement.getAttribute("data-archive") ?? "blog";
          const totalPaginationCount = parseInt(
            collectionElement.getAttribute("data-pagination") ?? "0"
          );

          for (let i = 1; i <= totalPaginationCount; i++) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.textContent = i;
            a.classList.add("page-numbers", "page-nav-button");
            if (pagination + 1 == i) {
              a.classList.add("current");
            }
            li.appendChild(a);
            paginationListElement.insertBefore(
              li,
              paginationListElement.children[
                paginationListElement.children.length - 1
              ]
            );
          }

          paginationListElement = container.querySelector("#pagination ul");
          collectionElement = container.querySelector(".cards-collection");

          const paginationButtons = Array.from(
            paginationListElement.querySelectorAll(".page-nav-button")
          );

          function updatePagination() {
            /*====== Update Content and Pagination ======*/
            const prevActiveButton = paginationListElement.querySelector(
              ".page-nav-button.current"
            );
            const currentActiveButton = paginationButtons[pagination];
            if (prevActiveButton) {
              prevActiveButton.classList.remove("current");
            }
            currentActiveButton.classList.add("current");

            if (collectionElement) {
              fetch(`/xquiste-portfolio/pagination/${archive}/page-${pagination + 1}.html`)
                .then((response) => response.text())
                .then((html) => {
                  collectionElement.innerHTML = html;
                });
            }
          }

          /*====== Pagination Page Numbers Click Event Listeners Setup ======*/
          paginationListElement
            .querySelectorAll(".page-nav-button")
            .forEach((button, index) => {
              button.addEventListener("click", () => {
                pagination = index;
                updatePagination();
              });
            });

          /*====== Left and Right Arrow Button Click Event Listeners Setup ======*/
          nextButton.addEventListener("click", () => {
            console.log("click");
            if (pagination == paginationButtons.length - 1) return;
            console.log("click");
            pagination += 1;
            updatePagination();
          });

          prevButton.addEventListener("click", () => {
            if (pagination == 0) return;
            pagination -= 1;
            updatePagination();
          });

          updatePagination();
        }
      });
  });

  /*====== Testimonial Auto Scroller Setup with Infinite Loop ======*/
  const testimonials = document.querySelector("#testimonials");
  if (testimonials) {
    const top = testimonials.querySelector(".top");
    top.style.setProperty("--scroll-width", `-${top.scrollWidth + 10}px`);
    top.style.setProperty("--scroll-time", `${top.children.length * 5}s`);
    top.innerHTML += top.innerHTML;

    const bottom = testimonials.querySelector(".bottom");
    bottom.style.setProperty("--scroll-width", `-${bottom.scrollWidth + 10}px`);
    bottom.style.setProperty("--scroll-time", `${bottom.children.length * 5}s`);
    bottom.innerHTML += bottom.innerHTML;
  }

  /*====== Swipeable Feedback Cards Setup ======*/
  const feedbackCard = document.querySelector(".feedback-card");
  if (feedbackCard) {
    const headContainer = feedbackCard.querySelector(".heads");
    const feedbackContainer = feedbackCard.querySelector(".feedbacks");
    const heads = feedbackCard.querySelectorAll(".head");
    const feedbacks = feedbackCard.querySelectorAll(".feedback");
    const currentIndex = feedbackCard.querySelector(".current-index");
    const indexCount = feedbackCard.querySelector(".index-count");
    const rightSwipe = feedbackCard.querySelector(".right-swipe-button");
    const leftSwipe = feedbackCard.querySelector(".left-swipe-button");

    if (heads.length == feedbacks.length) {
      const totalCount = heads.length;
      let index = 0;
      if (indexCount) indexCount.textContent = totalCount;

      function setView(behavior) {
        if (headContainer)
          headContainer.scrollTo({
            left: headContainer.offsetWidth * index,
            behavior: behavior,
          });
        if (feedbackContainer)
          feedbackContainer.scrollTo({
            left: feedbackContainer.offsetWidth * index,
            behavior: behavior,
          });
        if (currentIndex) currentIndex.textContent = index + 1;
      }

      rightSwipe.addEventListener("click", () => {
        index = (index + 1) % totalCount;
        setView("smooth");
      });

      leftSwipe.addEventListener("click", () => {
        index = index - 1;
        if (index == -1) index = totalCount - 1;
        setView("smooth");
      });

      const resizeObserver = new ResizeObserver((_) => {
        setView("instant");
      });

      resizeObserver.observe(feedbackContainer);

      document.addEventListener("keydown", (event) => {
        const bottomY = feedbackCard.getBoundingClientRect().bottom;
        if (bottomY > 0 && bottomY - window.innerHeight * 1.5 <= 0) {
          switch (event.key) {
            case "ArrowRight": {
              index = (index + 1) % totalCount;
              setView("smooth");
              break;
            }

            case "ArrowLeft": {
              index = index == 0 ? totalCount - 1 : index - 1;
              setView("smooth");
              break;
            }
          }
        }
      });
    }
  }

  /*====== Setup Titles Animation ======*/
  const titleContainers = document.querySelectorAll(".section-title-container");
  const titleContainersobserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        gsap.to(entry.target.children, {x : '0'})
      }
      else{
        if(entry.target.getBoundingClientRect().top > 0){

          gsap.to(entry.target.children, {x : '-100%'})
        }
        
      }
    })
  }, {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  });
  titleContainers.forEach((target) => titleContainersobserver.observe(target));


  setTimeout(() =>{
    gsap.set('body', {height : 'auto', overflowY : 'auto'})
    gsap.to('#loading-screen', {opacity : 0, pointerEvents : 'none'})
    lenis.start()
  },2000)
  
});
