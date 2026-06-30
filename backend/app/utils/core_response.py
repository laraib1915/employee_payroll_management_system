from fastapi.responses import JSONResponse


async def core_response(
    message: str,
    status_code: int,
    data: dict | list | None = None
):

    response_dict = {
        "message": message,
        "success": 1,
        "data": data
    }
    if not status_code in [200, 201]:
        response_dict["success"] = 0

    return JSONResponse(
        status_code=status_code,
        content=response_dict
    )