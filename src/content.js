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

const setDataAttributesForReordering = (comment, likeNum, i) => {
  comment.dataset.originalOrder = i;
  comment.dataset.likeNum = likeNum;
};

const appendButtonToReOrderComments = () => {
  const commentsHeading = document.querySelector('#comments .co-ItemWrapper_title');
  if (!commentsHeading || commentsHeading?.querySelector('button')) {
    return;
  }

  commentsHeading.insertAdjacentHTML(
    'beforeEnd',
    `<button class="qch-order-btn" data-order="timestamp">LGTM順に並びかえ</button>`
  );
  commentsHeading.querySelector('button').addEventListener('click', toggleCommentsOrder);
};

const toggleCommentsOrder = (e) => {
  if (e.target.dataset.order === 'timestamp') {
    orderByLikeNum();
    e.target.classList.add('qch-order-btn-lgtm');
    e.target.dataset.order = 'like';
    e.target.textContent = '時系列順に並びかえ';
  } else {
    orderByCommentTime();
    e.target.classList.remove('qch-order-btn-lgtm');
    e.target.dataset.order = 'timestamp';
    e.target.textContent = 'LGTM順に並びかえ';
  }
};

const orderByCommentTime = () => {
  const comments = getComments()
    .sort((a, b) => Number(a.dataset.originalOrder) > Number(b.dataset.originalOrder) ? 1 : -1);

  reOrder(comments);
}

const orderByLikeNum = () => {
  const comments = getComments()
    .sort((a, b) => Number(a.dataset.likeNum) > Number(b.dataset.likeNum) ? -1 : 1);

  reOrder(comments);
}

const reOrder = (comments) => {
  comments.forEach((comment, i) => {
    if (i >= comments.length - 1 || !comments[i + 1]) {
      return;
    }

    comment.after(comments[i + 1]);
  });
}

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

  appendButtonToReOrderComments();

  const colorsDelta = calcColorsDelta(maxLikeNum);
  comments.forEach((comment, i) => {
    const likeNum = likes[i];
    setDataAttributesForReordering(comment, likeNum, i);
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
