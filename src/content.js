import './assets/stylesheets/content.scss';

const COLORS_MAX = {
  R: 85,
  G: 197,
  B: 0,
  A: 0.3,
};

let observer;
const startObserver = () => {
  observer = new IntersectionObserver(main, {});
  const target = document.getElementById('comments-wrapper');
  observer.observe(target);
}

const sleep = (msec) => new Promise(resolve => setTimeout(() => resolve(), msec));

const waitCommentLoaded = async () => {
  for (let i = 0; i < 10; i ++) {
    const result = document.querySelector("#comments .co-Item");
    if (result) {
      break;
    }
    await sleep(1000);
  }
};

const getComments = () => Array.from(document.querySelectorAll('#comments .co-Item'));

const getLikeNumFromComment = (comment) => Number(comment?.querySelector('.co-Item_likeLabel')?.textContent || 0);

const calcColorsDelta = (maxLikeNum) => {
  const colorsDelta = {};
  Object.entries(COLORS_MAX).forEach(([color, cMax]) => {
    const delta = cMax / maxLikeNum;
    colorsDelta[color] = delta;
  });
  return colorsDelta;
};

const setBackgroundColor = (comment, likeNum, colorsDelta) => {
  if (likeNum === 0) {
    return;
  }

  const red = COLORS_MAX.R;
  const green = COLORS_MAX.G;
  const blue = COLORS_MAX.B;
  const alpha = colorsDelta.A * likeNum;
  comment.querySelector('.co-Item_footer').style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const main = async () => {
  await waitCommentLoaded();
  const comments = getComments();
  if (comments.length === 0) {
    return;
  }

  const likes = comments.map(comment => getLikeNumFromComment(comment));
  const maxLikeNum = Math.max(...likes);
  if (maxLikeNum === 0) {
    observer.disconnect();
    return;
  }

  const colorsDelta = calcColorsDelta(maxLikeNum);
  comments.forEach((comment, i) => {
    const likeNum = likes[i];
    if (likeNum === 0) {
      return;
    }

    setBackgroundColor(comment, likeNum, colorsDelta);
  });

  observer.disconnect();
};

(() => {
  startObserver();
})();
