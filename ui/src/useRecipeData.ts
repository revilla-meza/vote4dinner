import React from "react";
import produce from "immer";
import { useQuery, gql } from "@apollo/client";

type fetchStatus = "start" | "loading" | "success" | "error";

interface recipeDataState {
  status: fetchStatus;
  recipeIds: [string] | [];
  recipesById: any;
  nextToken?: string;
  filter: string;
}

function getQueryParams() {
  const params = new window.URLSearchParams(window.location.search);

  return {
    limit: params.get("limit"),
    filter: params.get("filter"),
  };
}

const initialState: recipeDataState = {
  status: "start",
  recipeIds: [],
  recipesById: {},
  filter: "",
};

export enum actionTypes {
  fetchingRecipes = "fetchingRecipes",
  fetchRecipesSuccess = "fetchRecipesSuccess",
  setNameFilter = "setNameFilter",
}

const reducer = produce((draft, action: any) => {
  switch (action.type) {
    case actionTypes.fetchingRecipes:
      draft.status = "loading";
      break;
    case actionTypes.fetchRecipesSuccess:
      for (let recipe of action.payload.recipes) {
        if (!draft.recipesById[recipe.id]) {
          draft.recipeIds.push(recipe.id);
          draft.recipesById[recipe.id] = recipe;
        }
      }
      draft.status = "start";
      if (draft.filter.length > 0){
        draft.filteringToken = action.payload.nextToken;
      } else {
        draft.nextToken = action.payload.nextToken;
        draft.filteringToken = action.payload.nextToken;
      }
      break;
    case actionTypes.setNameFilter:
      draft.filter = action.payload;
      // restart filtering starting point
      if (draft.filter.length === 0){
        draft.filteringToken = null;
      }
      break;
  }
});

const getRecipes = gql`
  query listRecipes($nextToken: String, $filter: String, $limit: Int) {
    listRecipes(
      nextToken: $nextToken
      filter: { searchField: { contains: $filter } }
      limit: $limit
    ) {
      recipes {
        id
        title
        description
        link
      }
      nextToken
    }
  }
`;

function useRecipeData() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { filter, limit } = getQueryParams();

  const { loading, error, data, refetch } = useQuery(getRecipes, {
    variables: { limit: limit || 6, filter: filter || "", nextToken: null },
  });



  React.useEffect(() => {
    if (loading) {
      dispatch({ type: actionTypes.fetchingRecipes });
    }
    if (data) {
      dispatch({
        type: actionTypes.fetchRecipesSuccess,
        payload: data.listRecipes,
      });
    }
  }, [data, loading]);

  return { state, dispatch, refetch };
}

export default useRecipeData;
