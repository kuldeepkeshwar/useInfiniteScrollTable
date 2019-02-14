import React from "react";
import useInfiniteScrollTable from "./useInfiniteScrollTable";
import Loader from "./Components/Loader";

function Filter({ filter, setFilter }) {
  return (
    <div>
      <button
        className={`btn link ${filter.status === undefined ? "active" : ""}`}
        onClick={() => setFilter({ status: undefined })}
      >
        All
      </button>
      <button
        className={`btn link ${filter.status === "active" ? "active" : ""}`}
        onClick={() => setFilter({ status: "active" })}
      >
        Active
      </button>
      <button
        className={`btn link ${filter.status === "expired" ? "active" : ""}`}
        onClick={() => setFilter({ status: "expired" })}
      >
        Expired
      </button>
    </div>
  );
}
export default function Table() {
  const {
    state: { items, loading, error, filter },
    scrollHandler,
    setFilter
  } = useInfiniteScrollTable({
    url: "/users",
    initialState: { filter: { status: undefined }, limit: 20 }
  });

  return (
    <div className="App">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="list" onScroll={scrollHandler}>
        <div className="row header">
          <div className="cell">ID</div>
          <div className="cell">NAME</div>
          <div className="cell">STATUS</div>
        </div>
        <div className="content grow">
          {items.map(item => {
            return (
              <div className="row" key={item.id}>
                <div className="cell">{item.id}</div>
                <div className="cell">{item.name}</div>
                <div className="cell">{item.status}</div>
              </div>
            );
          })}
          {loading ? <Loader /> : error ? <div>{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
