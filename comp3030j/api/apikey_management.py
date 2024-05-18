from comp3030j.db.User import User
from comp3030j.db.apikey import ApiKey
from typing import Union, cast

def list_apikeys(auth: Union[User, ApiKey]):
    user = auth if isinstance(auth, User) else auth.user
    apikeys = user.apikeys
    results = []
    for apikey in apikeys:
        res = {}
        for key, value in cast(dict, apikey.to_dict()).items(): 
            if key == "user_id":
                continue;
            if key == "token":
                value = value[:2] + "*" * (len(value) - 5) + value[-3:]
            res[key] = value
        results.append(res)
    return results, None

def create_apikey(auth: Union[User, ApiKey], desc: Union[str, None]):
    user = auth if isinstance(auth, User) else auth.user
    apikey = ApiKey(user.id, desc=desc)
    apikey.save_to_db()
    return apikey, None

def delete_apikey(auth: Union[User, ApiKey], id: int):
    user = auth if isinstance(auth, User) else auth.user
    apikey = ApiKey.find_by_id(id)
    if apikey is None:
        return None, ({"errorMsg": "No apikey found"}, 403)
    if apikey.user != user:
        return None, ({"errorMsg": "no permission to delete others' apikey"}, 403)
    apikey.delete_from_db()
    return {"msg": "success!"}, None


def set_key_enable_status(auth: Union[User, ApiKey], id: int, enabled: bool):
    user = auth if isinstance(auth, User) else auth.user
    apikey = ApiKey.find_by_id(id)
    if apikey is None:
        return None, ({"errorMsg": "No apikey found"}, 403)
    if apikey.user != user:
        return None, ({"errorMsg": "no permission to delete others' apikey"}, 403)
    apikey.set_enabled(enabled)
    return {"msg": "success!"}, None
    
