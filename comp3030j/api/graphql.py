from flask import Flask, jsonify, request, Blueprint
from ariadne import (
    QueryType,
    UnionType,
    ObjectType,
    graphql_sync,
    make_executable_schema,
)
from ariadne.explorer import ExplorerGraphiQL
from .security import auth_guard
from typing import Dict, Any
from comp3030j.api import profile, user, data
from comp3030j import app
import os
from comp3030j.db.User import User
from comp3030j.db.apikey import ApiKey
from typing import Union

bp = Blueprint("api/graphql", __name__, url_prefix="/graphql")

"""
Example Queries:

{
  me {
    profiles {
      id
      name
    }
  }
}

---------------

{
  profile(id: 1) {
    usage(
      start_time: "2023-1-31T23:00:00.000Z"
      end_time: "2023-2-26T23:00:00.000Z"
      aggregate: day
    )
  }
}

---------------
{
  data {
    sems(
      start_time: "2023-1-31T23:00:00.000Z"
      end_time: "2023-2-26T23:00:00.000Z"
      aggregate: day
    )
  }
}

===============
Advanced Examples

{
  me {
    profiles {
      usage(
        start_time: "2023-1-31T23:00:00.000Z"
        end_time: "2023-2-26T23:00:00.000Z"
        aggregate: day
      )
    }
  }
}


"""


def _return(ret: Tuple[Any, Any], process=None):
    res, response = ret
    if response and not (isinstance(response, int) and response // 100 == 2):
        raise Exception(f"Error: {response}")
    return process(res) if process else res


schema = ""
schema_file_path = os.path.join(app.instance_path, "schema.graphql")
with open(schema_file_path) as f:
    schema = f.read()

s_query = QueryType()
s_profile = ObjectType("Profile")
s_user = ObjectType("User")
s_data = ObjectType("Data")


@s_query.field("profile")
def query_profile(*_, id):
    return _return(profile.get_profile(id))


@s_query.field("me")
def query_me(*_):
    return "You"


@s_query.field("data")
def query_data(*_):
    return "Data"


@s_profile.field("usage")
def profile_usage(obj, _, **kwargs):
    profile_id = obj["id"]
    return _return(profile.usage(profile_id, kwargs))


@s_profile.field("solar")
def profile_solar(obj, _, **kwargs):
    profile_id = obj["id"]
    return _return(profile.usage(profile_id, kwargs))


@s_user.field("profiles")
@auth_guard(return_auth=True)
def user_profiles(auth: Union[User, ApiKey], *_):
    return _return(user.profiles(auth))


@s_data.field("sems")
def data_sems(*_, **kwargs):
    return _return(data.semspot(kwargs))


schema = make_executable_schema(schema, s_query, s_profile, s_user, s_data)


# Entry Point ==================================================================


# Example request
# curl -H 'Authorization: Bearer xxxxxxxxxxxxxx' --json '{"query":"{ hello }"}' http://localhost:5000/api/graphql
@bp.route("", methods=["POST"])
@bp.route("/", methods=["POST"])
@auth_guard()
def graphqlIndex():
    data = request.get_json()

    success, result = graphql_sync(
        schema, data, context_value={"request": request}, debug=app.debug
    )

    status_code = 200 if success else 400
    return result, status_code


# ariadne's graphiql is only allowed in debug mode
# since we uses parcel and preact to reduce the size of JS bounders
# you should login first, otherwise you cannot execute the query with a successful response
@bp.route("")
@bp.route("/")
def graphiql():
    if not app.debug:
        return "Not allowed", 400
    return ExplorerGraphiQL().html(request)
