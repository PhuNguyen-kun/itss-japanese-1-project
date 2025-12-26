const { PAGINATION } = require("../constants");

const getPaginationParams = (query) => {
  const page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  const per_page = Math.min(
    parseInt(query.per_page) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (page - 1) * per_page;

  return { page, per_page, offset };
};

const getPaginationMeta = (total, page, per_page) => {
  const total_pages = Math.ceil(total / per_page);

  return {
    page,
    per_page,
    total,
    total_pages,
  };
};

module.exports = {
  getPaginationParams,
  getPaginationMeta,
};
