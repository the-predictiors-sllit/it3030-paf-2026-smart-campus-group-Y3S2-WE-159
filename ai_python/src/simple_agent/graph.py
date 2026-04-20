"""Minimal LangChain agent graph for deployment."""
from __future__ import annotations
import ast
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from typing import Any

from langgraph.config import get_config
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

load_dotenv()

# DEFAULT_MODEL = os.getenv("SIMPLE_AGENT_MODEL", "anthropic:claude-sonnet-4-6")
modelName = os.getenv("MODEL_NAME")
modelBaseURL = os.getenv("OPENAI_BASE_URL")
modelApiKey = os.getenv("API_KEY")

model = ChatOpenAI(model=modelName, base_url=modelBaseURL, api_key=modelApiKey)

def my_node(state, config):
  UserJwtToken = config["configurable"].get("user_jwt_token")


@tool
def utc_now() -> str:
    """Return the current UTC timestamp in ISO format."""
    return datetime.now(tz=timezone.utc).isoformat()


@tool
def calculator(expression: str) -> str:
    """Evaluate a simple arithmetic expression safely.

    Supported operators: +, -, *, /, %, ** and parentheses.
    """
    parsed = ast.parse(expression, mode="eval")
    allowed_nodes = (
        ast.Expression,
        ast.BinOp,
        ast.UnaryOp,
        ast.Constant,
        ast.Add,
        ast.Sub,
        ast.Mult,
        ast.Div,
        ast.Mod,
        ast.Pow,
        ast.USub,
        ast.UAdd,
        ast.Load,
    )

    for node in ast.walk(parsed):
        if not isinstance(node, allowed_nodes):
            raise ValueError("Expression contains unsupported syntax")

    result: Any = eval(
        compile(parsed, "<calculator>", "eval"), {"__builtins__": {}}, {}
    )
    return str(result)

# ---------------------------------------------------------------------------------------------------------------



# testToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ims1VE9fTHBkX2NKWVVlcHhwTjdsbiJ9.eyJodHRwczovL3NtYXJ0Y2FtcHVzLmFwaS9yb2xlcyI6WyJBRE1JTiJdLCJodHRwczovL3NtYXJ0Y2FtcHVzLmFwaS9lbWFpbCI6ImFkbWluLnRlc3RAZ21haWwuY29tIiwiaHR0cHM6Ly9zbWFydGNhbXB1cy5hcGkvbmFtZSI6ImFkbWluLnRlc3RAZ21haWwuY29tIiwiaXNzIjoiaHR0cHM6Ly9kZXYtNGNpa3czc3VlMHZ3c2x5MC51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjljMjI2OGJiYmNiZDVkY2M4YzVhMDRhIiwiYXVkIjpbImh0dHBzOi8vc21hcnRjYW1wdXMuYXBpIiwiaHR0cHM6Ly9kZXYtNGNpa3czc3VlMHZ3c2x5MC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzc2NDI5MTc3LCJleHAiOjE3NzY1MTU1NzcsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJRUmcxNWtac1ZHS29VNVBmNDJhbjRlSW5CeTRSMlpuMCJ9.O4Z1mU_-_703hOf55Aas53r0oOn_zd4EAxo9jemnEP28D00KO9ba8v651p71nLo8bpjwqSD-ptViqfNOF081GlsKziBlwskXUIy_tXwvTkeaH5T-ZXYtHRSwmHCVqR0MB1-pck4GBo38PWbExKQm6GhxC2lMNj0f1jVMsiZbSOLI9lSDTYK3-vY7aDdEqN8xPYPKuO4cxKOhaVrXPhyYvlduINteOZfOBGn-I1o5jhNFM4TrN_GvO9WpKUgnP9z4yQHRGe0ufXjAIqhiv9lx3YQUrRMQF4Ux-aaAUMAE74o0CyIZ2SEJYcKCfFz82Sc1n3e8pAm5MoGQ8-orllQKGw"


def searchByLocation(
    itemList: list,
    query: str,
    top_n: int = 3,
    threshold: int = 40,
    weights: dict | None = None,
) -> list[dict]:
    """
    Returns up to top_n items whose combined score >= threshold.

    Weights control how much each scorer contributes (must sum to 1.0):
    fuzzy_ratio   - character-level edit distance
    token_sort    - word-order-agnostic token overlap
    partial_ratio - best substring match (helps with short queries)
    tfidf         - n-gram keyword similarity
    """
    if not itemList:
        return []
    from thefuzz import fuzz
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import re

    def normalize(text: str) -> str:
        text = text.lower().strip()  # to lower case
        text = re.sub(
            r"[^\w\s.]", " ", text
        )  # remove every thing that not is an letter, number, space,period
        text = re.sub(r"\s+", " ", text)  # remove white spaces
        return text

    original_string = [item["location"] for item in itemList]

    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))

    tfidf_matrix = vectorizer.fit_transform([normalize(n) for n in original_string])

    if weights is None:
        weights = {
            "fuzzy_ratio": 0.30,
            "token_sort": 0.30,
            "partial_ratio": 0.20,
            "tfidf": 0.20,
        }

    norm_query = normalize(query)
    query_vec = vectorizer.transform([norm_query])
    tfidf_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()

    results = []
    for i, item in enumerate(itemList):
        norm_name = normalize(item["location"])

        fr = fuzz.ratio(norm_query, norm_name)
        ts = fuzz.token_sort_ratio(norm_query, norm_name)
        pr = fuzz.partial_ratio(norm_query, norm_name)
        tf = tfidf_scores[i] * 100

        combined = (
            weights["fuzzy_ratio"] * fr
            + weights["token_sort"] * ts
            + weights["partial_ratio"] * pr
            + weights["tfidf"] * tf
        )

        if combined >= threshold:
            results.append(
                {
                    "item": item,
                    "score": round(combined, 1),
                    "detail": {
                        "fuzzy": fr,
                        "token_sort": ts,
                        "partial": pr,
                        "tfidf": round(tf, 1),
                    },
                }
            )
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]


def searchByName(
    itemList: list,
    query: str,
    top_n: int = 3,
    threshold: int = 40,
    weights: dict | None = None,
) -> list[dict]:
    """
    Returns up to top_n items whose combined score >= threshold.

    Weights control how much each scorer contributes (must sum to 1.0):
    fuzzy_ratio   - character-level edit distance
    token_sort    - word-order-agnostic token overlap
    partial_ratio - best substring match (helps with short queries)
    tfidf         - n-gram keyword similarity
    """
    if not itemList:
        return []

    from thefuzz import fuzz
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import re

    def normalize(text: str) -> str:
        text = text.lower().strip()  # to lower case
        text = re.sub(
            r"[^\w\s.]", " ", text
        )  # remove every thing that not is an letter, number, space,period
        text = re.sub(r"\s+", " ", text)  # remove white spaces
        return text

    original_string = [item["name"] for item in itemList]

    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))

    tfidf_matrix = vectorizer.fit_transform([normalize(n) for n in original_string])

    if weights is None:
        weights = {
            "fuzzy_ratio": 0.30,
            "token_sort": 0.30,
            "partial_ratio": 0.20,
            "tfidf": 0.20,
        }

    norm_query = normalize(query)
    query_vec = vectorizer.transform([norm_query])
    tfidf_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()

    results = []
    for i, item in enumerate(itemList):
        norm_name = normalize(item["name"])

        fr = fuzz.ratio(norm_query, norm_name)
        ts = fuzz.token_sort_ratio(norm_query, norm_name)
        pr = fuzz.partial_ratio(norm_query, norm_name)
        tf = tfidf_scores[i] * 100

        combined = (
            weights["fuzzy_ratio"] * fr
            + weights["token_sort"] * ts
            + weights["partial_ratio"] * pr
            + weights["tfidf"] * tf
        )

        if combined >= threshold:
            results.append(
                {
                    "item": item,
                    "score": round(combined, 1),
                    "detail": {
                        "fuzzy": fr,
                        "token_sort": ts,
                        "partial": pr,
                        "tfidf": round(tf, 1),
                    },
                }
            )
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]


@tool
def campusResources(
    location: str = None,
    name: str = None,
    capacity: int = None,
    type: str = None,
):
    """
    Retrieve campus resources such as rooms, labs, and equipment.

    Use this tool whenever the user asks about:
    - Finding or booking a room, lab, or piece of equipment.
    - Checking what resources are available on campus.
    - Searching for a resource by name or location.
    - Filtering resources by capacity or type.

    Args:
        name (str, optional): 
            The name or partial name of the resource (e.g., "Chemistry Lab", "Lecture Hall"). 
            Uses fuzzy search, so exact spelling is not required. Can be used independently to filter.
            Leave empty if no specific resource name is mentioned.

        location (str, optional): 
            A building, floor, or area to search within (e.g., "Building 2", "Library", "Floor 3"). 
            Uses fuzzy search, so partial location names work fine. Can be used independently to filter.
            Leave empty if no location is mentioned.

        capacity (int, optional): 
            Minimum number of people the resource must accommodate. 
            Returns only resources with a capacity greater than or equal to this value.
            Note: Use this primarily for ROOM and LAB types. Do not combine with the `name` argument unless the user explicitly mentions both a name and a capacity requirement. Can be used independently to filter.
            Leave empty if the user does not mention a group size or capacity requirement.

        type (str, optional): 
            The category of the resource. Must be strictly one of the following:
                - "ROOM"      → Meeting rooms, lecture halls, study pods.
                - "LAB"       → Science or computer labs.
                - "EQUIPMENT" → Projectors, cameras, microphones, etc.
            Can be used independently to filter. Leave empty if the user does not specify a type.

    Returns:
        str: A JSON string containing a list of matching resource objects, each with:
            id, name, type, capacity, location, and status.
            Returns an error message string if the request fails.

    Examples:
        User: "What are the available resources in Building 1?"
            → location="Building 1"
        
        User: "What are the rooms available on building 1"
            → location="Building 1" type="ROOM"
            
        User: "Find me a lab in Building 2."
            → location="Building 2", type="LAB"

        User: "Is there a room that fits 50 people?"
            → capacity=50, type="ROOM"

        User: "Show me all available equipment."
            → type="EQUIPMENT"

        User: "I need the Advanced Robotics lab."
            → name="Advanced Robotics", type="LAB"
    """

    config = get_config()
    userjwttoken = config["configurable"].get("userjwttoken")

    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print('-------------------------------------------------------------------------------------')
    print(userjwttoken)


    if not userjwttoken:
        return "Error: No Authorization token provided in request configuration."

    location = location.strip() if location else None
    name = name.strip() if name else None
    type = type.strip() if type else None

    import requests
    import json

    base_url = os.getenv("BACKEND_API_URL")
    url = f"{base_url}/api/resources"

    headers = {
        "Authorization": userjwttoken,
        "Content-Type": "application/json",
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            itemList = []
            for item in data["data"]["items"]:
                formattedItem = {
                    "id": item["id"],
                    "name": item["name"],
                    "type": item["type"],
                    "capacity": item["capacity"],
                    "location": item["location"],
                    "status": item["status"],
                }
                itemList.append(formattedItem)

            if name and location and len(name)>0 and len(location)>0:
                name_ids = {
                    r["item"]["id"] for r in searchByName(query=name, itemList=itemList)
                }
                loc_ids = {
                    r["item"]["id"]
                    for r in searchByLocation(query=location, itemList=itemList)
                }
                matched_ids = name_ids & loc_ids
                itemList = [i for i in itemList if i["id"] in matched_ids]
            elif name and len(name)>0:
                itemList = [
                    r["item"] for r in searchByName(query=name, itemList=itemList)
                ]
            elif location and len(location)>0:
                itemList = [
                    r["item"]
                    for r in searchByLocation(query=location, itemList=itemList)
                ]
            if capacity:
                itemList = [
                    i
                    for i in itemList
                    if i.get("capacity") is not None and i["capacity"] >= capacity
                ]

            if type and len(type)>0:
                itemList = [i for i in itemList if i.get("type") == type]

            # return itemList
            return json.dumps(itemList)

    except Exception as e:
        return f"Error accessing campus resources: {str(e)}"


# ---------------------------------------------------------------------------------------------------------------


# graph = create_agent(
#     model=model,
#     tools=[utc_now, calculator,campusResources],
#     system_prompt=(
#         "You are a concise assistant. "
#         "Use tools when they add factual precision, then return a direct answer."
#     ),
#     name="simple_agent",
# )

graph = create_react_agent(
    model=model,
    tools=[utc_now, calculator, campusResources],
    prompt=(
        "You are a concise assistant. "
        "Use tools when they add factual precision, then return a direct answer."
    ),
)



# # Augment the LLM with tools
# tools = [utc_now, calculator, campusResources]
# tools_by_name = {tool.name: tool for tool in tools}
# model_with_tools = model.bind_tools(tools)


# from langchain.messages import AnyMessage
# from typing_extensions import TypedDict, Annotated
# import operator


# class MessagesState(TypedDict):
#     messages: Annotated[list[AnyMessage], operator.add]
#     llm_calls: int

# # Step 3: Define model node
# from langchain.messages import SystemMessage


# def llm_call(state: dict):
#     """LLM decides whether to call a tool or not"""

#     return {
#         "messages": [
#             model_with_tools.invoke(
#                 [
#                     SystemMessage(
#                         content="You are a helpful assistant.Use tools when they add factual precision, then return a direct answer."
#                     )
#                 ]
#                 + state["messages"]
#             )
#         ],
#         "llm_calls": state.get('llm_calls', 0) + 1
#     }

# # Step 4: Define tool node

# from langchain.messages import ToolMessage

# def tool_node(state: dict):
#     """Performs the tool call"""

#     result = []
#     for tool_call in state["messages"][-1].tool_calls:
#         tool = tools_by_name[tool_call["name"]]
#         observation = tool.invoke(tool_call["args"])
#         result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
#     return {"messages": result}


# from typing import Literal
# from langgraph.graph import StateGraph, START, END


# # Conditional edge function to route to the tool node or end based upon whether the LLM made a tool call
# def should_continue(state: MessagesState) -> Literal["tool_node", END]:
#     """Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""

#     messages = state["messages"]
#     last_message = messages[-1]

#     # If the LLM makes a tool call, then perform an action
#     if last_message.tool_calls:
#         return "tool_node"

#     # Otherwise, we stop (reply to the user)
#     return END

# agent_builder = StateGraph(MessagesState)

# # Add nodes
# agent_builder.add_node("llm_call", llm_call)
# agent_builder.add_node("tool_node", tool_node)

# # Add edges to connect nodes
# agent_builder.add_edge(START, "llm_call")
# agent_builder.add_conditional_edges(
#     "llm_call",
#     should_continue,
#     ["tool_node", END]
# )
# agent_builder.add_edge("tool_node", "llm_call")

# # Compile the agent
# graph = agent_builder.compile()