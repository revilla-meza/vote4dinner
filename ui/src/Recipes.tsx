import React from "react";
import useRecipeData from "./useRecipeData";
import { actionTypes } from "./useRecipeData";

const filterByNamePredicate = (title: string, filter: string) =>
  title.toLowerCase().includes(filter.toLowerCase());

function Recipes() {
  const { state, dispatch, refetch } = useRecipeData();
  const { recipesById: recipes, recipeIds: ids, nextToken, filteringToken, filter } = state;
  const token = filter.length > 0 ? filteringToken : nextToken; 

  const [timeOutId, setTimeOutId]:[null|number, any] = React.useState(null);
  const itemsToRender = ids ? ids
  .filter((id: string) => filterByNamePredicate(recipes[id].title, filter)) : [];

  const renderItems = itemsToRender.map((id: string) => <div key={id}>{recipes[id].title}</div>)
  
  // "filter server-side"
  React.useEffect(()=>{
    if(state.filter.length > 0 && itemsToRender.length < 7){
      if(timeOutId){
        clearTimeout(timeOutId);
      }
      const id = window.setTimeout(()=>{
       refetch({nextToken: state.filteringToken, filter: state.filter });
      }, 500);
      setTimeOutId(id);
   }
  }, [state.filter, itemsToRender.length]);

  return (
    <div>
      <input
        onChange={(ev) => {
          dispatch({
            type: actionTypes.setNameFilter,
            payload: ev.target.value,
          });
        }}
        type="text"
        value={filter}
        placeholder="filter recipes"
      />
      {renderItems}
      {token && (
        <button
          onClick={() => {
            refetch({ nextToken: token, filter: state.filter });
          }}
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default Recipes;
