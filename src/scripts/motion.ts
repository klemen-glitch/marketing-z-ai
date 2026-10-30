import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const CINEMATIC = '(min-width: 960px) and (hover: hover) and (pointer: fine)';

let lenis: Lenis | null = null;
let agentsTween: gsap.core.Tween | null = null;
let parallaxTween: gsap.core.Tween | null = null;
const serviceTweens: gsap.core.Tween[] = [];

function splitElement(el: HTMLElement) {
  if (el.dataset.splitDone === '1') return el.querySelectorAll<HTMLElement>('.rise');
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  el.dataset.splitDone = '1';
  el.textContent = '';
  const words = text.split(' ');
  words.forEach((word, index) => {
    const mask = document.createElement('span');
    mask.className = 'mask';
    const rise = document.createElement('span');
    rise.className = 'rise';
    const base = el.closest('#hero') ? 520 : 30;
    rise.style.setProperty('--d', `${base + index * 26}ms`);
    rise.textContent = word;
    mask.appendChild(rise);
    el.appendChild(mask);
    if (index < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return el.querySelectorAll<HTMLElement>('.rise');
}

function revealWhenVisible(elements: ArrayLike<Element>) {
  const list = Array.from(elements);
  if (!list.length || !('IntersectionObserver' in window)) {
    list.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      if (target.classList.contains('line') || target.classList.contains('mask')) {
        target.querySelectorAll('.word, .rise').forEach((el) => el.classList.add('is-in'));
      } else {
        target.classList.add('is-in');
      }
      observer.unobserve(target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  list.forEach((el) => observer.observe(el));
}

function killTween(tween: gsap.core.Tween | null) {
  tween?.scrollTrigger?.kill();
  tween?.kill();
}

function setupProgress() {
  const bar = document.querySelector<HTMLElement>('.progress span');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupLenis(cinematic: MediaQueryList) {
  if (!cinematic.matches) {
    lenis?.destroy();
    lenis = null;
    window.__mzaiLenis = undefined;
    return;
  }
  if (lenis) return;
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
    anchors: { offset: -88 },
    stopInertiaOnNavigate: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  window.__mzaiLenis = lenis;
}

function setupSplits() {
  document.querySelectorAll<HTMLElement>('#hero .word').forEach((word, index) => {
    word.style.setProperty('--d', `${index * 70}ms`);
  });
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    splitElement(el);
  });
  document.querySelectorAll<HTMLElement>('[data-rise-group] .rise').forEach((rise, index) => {
    rise.style.setProperty('--d', `${index * 80}ms`);
  });
  revealWhenVisible(document.querySelectorAll('.hero-title .line, .mask, [data-reveal]'));
}

function setupParallax(cinematic: MediaQueryList) {
  killTween(parallaxTween);
  parallaxTween = null;
  const orb = document.querySelector('.orb');
  if (orb) gsap.set(orb, { clearProps: 'transform' });
  if (!cinematic.matches || !orb) return;
  parallaxTween = gsap.to(orb, {
    y: 120,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

let serviceIndexReady = false;

function setupServiceStack(cinematic: MediaQueryList) {
  serviceTweens.forEach((tween) => killTween(tween));
  serviceTweens.length = 0;
  document.querySelectorAll('.svc-card-inner').forEach((inner) => {
    gsap.set(inner, { clearProps: 'transform' });
  });

  const current = document.querySelector<HTMLElement>('[data-svc-current]');
  const cards = gsap.utils.toArray<HTMLElement>('.svc-card');
  if (!serviceIndexReady) {
    serviceIndexReady = true;
    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive && current) {
            current.textContent = String(index + 1).padStart(2, '0');
          }
        },
      });
    });
  }

  if (!cinematic.matches) return;
  cards.forEach((card, index) => {
    const next = cards[index + 1];
    const inner = card.querySelector('.svc-card-inner');
    if (!next || !inner) return;
    serviceTweens.push(
      gsap.to(inner, {
        scale: 0.94,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: 'top 18%',
          scrub: true,
        },
      }),
    );
  });
}

function setupAgents(cinematic: MediaQueryList) {
  killTween(agentsTween);
  agentsTween = null;
  const root = document.querySelector<HTMLElement>('[data-agents]');
  const track = root?.querySelector<HTMLElement>('.agents-track');
  const pin = root?.querySelector<HTMLElement>('.agents-pin');
  if (track) gsap.set(track, { clearProps: 'transform' });

  document.documentElement.classList.toggle('cinematic', cinematic.matches);
  if (!cinematic.matches || !root || !track || !pin) return;

  const distance = () => {
    const viewport = track.parentElement;
    if (!viewport) return 0;
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  };

  if (distance() < 16) return;

  agentsTween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.75,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
}

function bindMenuLock() {
  window.addEventListener('mzai:menu', (event) => {
    const open = (event as CustomEvent<{ open: boolean }>).detail?.open;
    if (open) lenis?.stop();
    else lenis?.start();
  });
}

export function initMotion() {
  setupProgress();
  bindMenuLock();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    document.documentElement.classList.remove('is-motion');
    return;
  }

  try {
    const cinematic = window.matchMedia(CINEMATIC);
    ScrollTrigger.config({ ignoreMobileResize: true });
    setupLenis(cinematic);
    setupSplits();
    setupParallax(cinematic);
    setupServiceStack(cinematic);
    setupAgents(cinematic);

    const onMode = () => {
      setupLenis(cinematic);
      setupParallax(cinematic);
      setupServiceStack(cinematic);
      setupAgents(cinematic);
      ScrollTrigger.refresh();
    };
    cinematic.addEventListener('change', onMode);

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    document.documentElement.classList.add('motion-ready');
  } catch (error) {
    console.error(error);
    document.documentElement.classList.remove('is-motion');
  }
}

declare global {
  interface Window {
    __mzaiLenis?: { stop: () => void; start: () => void } | undefined;
  }
}
