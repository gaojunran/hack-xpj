(async () => {
  const API_BASE = `${location.origin}/mjwzx2022/xpj2025/`;

  const buildURL = (path, params) => {
    const u = new URL(path, API_BASE);
    params && Object.entries(params).forEach(([k, v]) => v != null && u.searchParams.set(k, v));
    return u;
  };

  const fetchJSON = async (path, { params, method = 'GET', body } = {}) => {
    const url = buildURL(path, method === 'GET' ? params : undefined);
    const resp = await fetch(url, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-cache',
    });
    const text = await resp.text();
    if (!(resp.headers.get('content-type') || '').includes('application/json')) {
      throw new Error(`非 JSON，status=${resp.status}\nURL=${url}\n摘录:\n${text.slice(0, 200)}...`);
    }
    return JSON.parse(text);
  };

  const getJSON = (params) => fetchJSON('index.php', { params });
  const postJSON = (body) => fetchJSON('post.php', { method: 'POST', body });

  // 拉取课程列表
  const rw = await getJSON({ action: 'stuGetRw' });
  if (rw.code !== 0) throw new Error(rw.info || '获取课程失败');
  const courses = rw.data || [];
  if (!courses.length) throw new Error('没有课程数据（检查登录）');

  const maxTimes = 2; // 需要更多就改这里

  for (const course of courses) {
    const done = course.pjNum || 0;
    if (done >= maxTimes) {
      console.log(`跳过（已满）：${course.kcmc} - ${course.teaName}`);
      continue;
    }

    for (let round = done; round < maxTimes; round++) {
      console.log(`取指标：${course.kcmc} - ${course.teaName} 第 ${round + 1} 次`);
      const zb = await getJSON({
        action: 'stuGetJxbZb',
        jxb: course.jxb,
        teaId: course.teaId,
        pjCs: '',
      });
      if (zb.code !== 0) {
        console.warn('取指标失败', course.kcmc, zb.info);
        break;
      }

      const rubric = zb.data || {};
      const scoreDetail = [];
      Object.entries(rubric)
        .filter(([k, v]) => k !== 'memo' && Array.isArray(v))
        .forEach(([, arr]) =>
          arr.forEach((item) => {
            if (item?.orderNum != null) {
              scoreDetail[item.orderNum - 1] = { orderNum: item.orderNum, score: 10 };
            }
          })
        );

      const memo = rubric.memo || '老师辛苦了，满分！';
      const submit = await postJSON({
        action: 'stuPj',
        jxb: course.jxb,
        teaId: course.teaId,
        scoreDetail: scoreDetail.filter(Boolean),
        memoDetail: memo,
      });

      if (submit.code === 0) {
        console.log(`✅ 成功：${course.kcmc} - 第 ${round + 1} 次`);
      } else {
        console.warn(`❌ 失败：${course.kcmc} - 第 ${round + 1} 次`, submit.info || submit.code);
        break;
      }
    }
  }
})().catch((err) => console.error('脚本出错:', err));
