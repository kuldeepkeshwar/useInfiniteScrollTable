import { useReducer, useEffect, useState, useRef } from "react";
import useSafeFunction from "./useSafeFunction";
import axios from "axios";

const initialState = {
  items: [],
  loading: false,
  error: null,
  filter: null,
  pagination: {
    limit: 5,
    offset: 0,
    totalRecords: 0
  }
};
function reducer(state, { type, payload }) {
  switch (type) {
    case "filter": {
      const { filter } = payload;
      return {
        ...state,
        items: [],
        pagination: {
          limit: state.pagination.limit,
          offset: 0,
          totalRecords: 0
        },
        filter
      };
    }
    case "fetch_start": {
      return {
        ...state,
        loading: true,
        error: null
      };
    }
    case "fetch_success": {
      const { items, totalRecords } = payload;
      const { limit, offset } = state.pagination;
      return {
        ...state,
        items: state.items.concat(...items),
        loading: false,
        pagination: {
          limit: limit,
          offset: offset,
          totalRecords: totalRecords
        }
      };
    }
    case "fetch_failure": {
      const { error } = payload;
      return {
        ...state,
        loading: false,
        error
      };
    }
    case "next": {
      const { limit, offset, totalRecords } = state.pagination;
      if (offset + limit < totalRecords) {
        return {
          ...state,
          pagination: {
            limit: limit,
            offset: offset + limit,
            totalRecords: totalRecords
          }
        };
      } else {
        throw new Error("offset + limit should be less than totalRecords");
      }
    }
    case "previous": {
      const { limit, offset, totalRecords } = state.pagination;
      if (offset - limit < 0) {
        throw new Error("offset should be greater than/equal Zero");
      }
      return {
        ...state,
        pagination: {
          limit: limit,
          offset: offset - limit,
          totalRecords: totalRecords
        }
      };
    }
    default:
      throw new Error("Missing action type");
  }
}
export default function useInfiniteScrollTable({
  url,
  initialState: { filter, limit }
}) {
  const [state, $dispatch] = useReducer(reducer, {
    ...initialState,
    filter,
    pagination: { ...initialState.pagination, limit }
  });
  const [isFinished, setFinished] = useState(true);
  const lastScroll = useRef(0);

  const dispatch = useSafeFunction(function(...args) {
    $dispatch(...args);
  });
  useEffect(fetchItems, [state.filter, state.pagination.offset]);

  function setFilter(filter) {
    dispatch({ type: "filter", payload: { filter } });
    setFinished(true);
    lastScroll.current = 0;
  }
  function next() {
    const { limit, offset, totalRecords } = state.pagination;
    if (isFinished && limit + offset < totalRecords) {
      dispatch({ type: "next" });
      setFinished(false);
    }
  }

  function fetchItems() {
    const {
      filter,
      pagination: { limit, offset }
    } = state;
    const params = { filter, limit, offset };
    dispatch({ type: "fetch_start" });
    axios
      .get(url, { params })
      .then(function(resp) {
        const { items, totalRecords } = resp.data;
        dispatch({ type: "fetch_success", payload: { items, totalRecords } });
        setFinished(true);
      })
      .catch(function(err) {
        const error = err.response.data;
        dispatch({ type: "fetch_failure", payload: { error } });
        setFinished(true);
      });
  }
  function scrollHandler(event) {
    if (lastScroll.current < event.target.scrollTop) {
      next();
      lastScroll.current = event.target.scrollTop;
    } else {
      // console.log("up");
    }
  }
  return { state, scrollHandler, setFilter };
}
