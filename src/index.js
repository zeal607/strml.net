import 'classlist-polyfill';
import Promise from 'bluebird';
import Markdown from 'markdown';
const md = Markdown.markdown.toHTML;
import workText from 'raw-loader!./doc/work.txt';
import pgpText from 'raw-loader!./doc/pgp.txt';
import headerHTML from 'raw-loader!./html/header.html';
let styleText = [0, 1, 2, 3].map(function(i) { return require('raw-loader!./css/styles' + i + '.css'); });
import preStyles from 'raw-loader!./css/prestyles.css';
import replaceURLs from '../lib/replaceURLs';
import {default as writeChar, writeSimpleChar, handleChar} from '../lib/writeChar';
import getPrefix from '../lib/getPrefix';

// Vars that will help us get er done
// const isDev = window.location.hostname === 'localhost';
const speed = 60;
let styleTag, //style标签
styleInputEl, //style文本输入框
 workEl, pgpEl, skipAnimationEl, pauseEl;
let animationSkipped = false, done = false, paused = false;
let browserPrefix;

// 页面载入完成后的初始化
document.addEventListener("DOMContentLoaded", function() {
  getBrowserPrefix();
  populateHeader();
  getEls();
  createEventHandlers();
  startAnimation();
});

async function startAnimation() {
  try {
    await writeTo(styleInputEl, styleText[0], 0, speed, true, 1);
    // await writeTo(workEl, workText, 0, speed, false, 1);
    await writeTo(styleInputEl, styleText[1], 0, speed, true, 1);
    createWorkBox();
    await Promise.delay(1000);
    await writeTo(styleInputEl, styleText[2], 0, speed, true, 1);
    await writeTo(pgpEl, pgpText, 0, speed, false, 32);
    await writeTo(styleInputEl, styleText[3], 0, speed, true, 1);
  }
  // Flow control straight from the ghettos of Milwaukee
  catch(e) {
    if (e.message === "SKIP IT") {
      surprisinglyShortAttentionSpan();
    } else {
      throw e;
    }
  }
}

// Skips all the animations.
async function surprisinglyShortAttentionSpan() {
  if (done) return;
  done = true;
  pgpEl.innerHTML = pgpText;
  let txt = styleText.join('\n');

  // The work-text animations are rough
  styleTag.textContent = "#work-text * { " + browserPrefix + "transition: none; }";
  styleTag.textContent += txt;
  let styleHTML = "";
  for(let i = 0; i < txt.length; i++) {
     styleHTML = handleChar(styleHTML, txt[i]);
  }
  styleInputEl.innerHTML = styleHTML;
  createWorkBox();

  // There's a bit of a scroll problem with this thing
  let start = Date.now();
  while(Date.now() - 1000 > start) {
    workEl.scrollTop = Infinity;
    styleInputEl.scrollTop = pgpEl.scrollTop = Infinity;
    await Promise.delay(16);
  }
}


/**
 * Helpers
 */

let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;

/**
 * 
 * @param {*} el 容器元素
 * @param {*} message 内容
 * @param {*} index 字符序号
 * @param {*} interval 
 * @param {*} mirrorToStyle 
 * @param {*} charsPerInterval 每次渲染几个字符
 */
async function writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval){
  if (animationSkipped) {
    // 跳过动画
    throw new Error('SKIP IT');
  }
  // 获取待渲染的字符
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  // 确保滚动条处于最下方
  el.scrollTop = el.scrollHeight;

  // If this is going to <style> it's more complex; otherwise, just write.
  if (mirrorToStyle) {
    writeChar(el, chars, styleTag);
  } else {
    writeSimpleChar(el, chars);
  }

  // Schedule another write.
  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);
    if (comma.test(thisSlice)) thisInterval = interval * 30;
    if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
    if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

    do {
      await Promise.delay(thisInterval);
    } while(paused);

    return writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval);
  }
}

//
// Older versions of major browsers (like Android) still use prefixes. So we figure out what that prefix is
// and use it.
//
function getBrowserPrefix() {
  // Ghetto per-browser prefixing
  browserPrefix = getPrefix(); // could be empty string, which is fine
  styleText = styleText.map(function(text) {
    return text.replace(/-webkit-/g, browserPrefix);
  });
}

//
// 载入基础样式,获取元素引用
//
function getEls() {
  let preStyleEl = document.createElement('style');
  preStyleEl.textContent = preStyles;
  document.head.insertBefore(preStyleEl, document.getElementsByTagName('style')[0]);

  styleTag = document.getElementById('style-tag');
  styleInputEl = document.getElementById('style-text');
  workEl = document.getElementById('work-text');
  pgpEl = document.getElementById('pgp-text');
  skipAnimationEl = document.getElementById('skip-animation');
  pauseEl = document.getElementById('pause-resume');
}

//
// 插入头部html
//
function populateHeader() {
  let header = document.getElementById('header');
  header.innerHTML = headerHTML;
}

//
// 创建针对用户操作的基本监听
//
function createEventHandlers() {
  // 监听用户对样式的修改，并实时渲染
  styleInputEl.addEventListener('input', function() {
    styleTag.textContent = styleInputEl.textContent;
  });

  //跳过动画
  skipAnimationEl.addEventListener('click', function(e) {
    e.preventDefault();
    animationSkipped = true;
  });
  //暂停与继续
  pauseEl.addEventListener('click', function(e) {
    e.preventDefault();
    if (paused) {
      pauseEl.textContent = "暂停 ||";
      paused = false;
    } else {
      pauseEl.textContent = "继续 >>";
      paused = true;
    }
  });
}

//
// Fire a listener when scrolling the 'work' box.
//
function createWorkBox() {
  if (workEl.classList.contains('flipped')) return;
  workEl.innerHTML = '<div class="text">' + replaceURLs(workText) + '</div>' +
                     '<div class="md">' + replaceURLs(md(workText)) + '<div>';

  workEl.classList.add('flipped');
  workEl.scrollTop = 9999;

  // flippy floppy
  let flipping = 0;
  require('mouse-wheel')(workEl, async function(dx, dy) {
    if (flipping) return;
    let flipped = workEl.classList.contains('flipped');
    let half = (workEl.scrollHeight - workEl.clientHeight) / 2;
    let pastHalf = flipped ? workEl.scrollTop < half : workEl.scrollTop > half;

    // If we're past half, flip the el.
    if (pastHalf) {
      workEl.classList.toggle('flipped');
      flipping = true;
      await Promise.delay(500);
      workEl.scrollTop = flipped ? 0 : 9999;
      flipping = false;
    }

    // Scroll. If we've flipped, flip the scroll direction.
    workEl.scrollTop += (dy * (flipped ? -1 : 1));
  }, true);
}
