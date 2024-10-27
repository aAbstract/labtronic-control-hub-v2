import os
import json
import pickle
import random
import uvicorn
import logging
import numpy as np
from fastapi import Body
from typing import Literal
from fastapi import FastAPI
from datetime import datetime
from uvicorn.config import LOGGING_CONFIG
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer


def load_log_config():
    datefmt = '%Y-%m-%dT%H:%M:%S'
    log_fmt = '%(levelprefix)s %(asctime)s\t%(message)s'
    # default logger
    LOGGING_CONFIG['formatters']['default']['datefmt'] = datefmt
    LOGGING_CONFIG['formatters']['default']['fmt'] = log_fmt
    # access logger
    LOGGING_CONFIG['formatters']['access']['datefmt'] = datefmt
    LOGGING_CONFIG['formatters']['access']['fmt'] = log_fmt


def load_st_model(st_model_file: str):
    logging.getLogger('uvicorn').info(f"Loading SentenceTransformer Model {st_model_file}...")
    global all_mlm_l6
    try:
        with open(st_model_file, 'rb') as f:
            all_mlm_l6 = pickle.load(f)
    except:
        logging.getLogger('uvicorn').error(f"Loading SentenceTransformer Model {st_model_file}...ERR")
    logging.getLogger('uvicorn').info(f"Loading SentenceTransformer Model {st_model_file}...OK")


def check_state_file():
    if os.path.exists('_.json'):
        return
    logging.getLogger('uvicorn').warning('State JSON File _.json not Found')
    with open('_.json', 'w') as f:
        f.write('{}')


@asynccontextmanager
async def lifespan(app: FastAPI):
    # init app
    check_state_file()
    load_st_model('all_mlm_l6.pkl')
    yield
    # clean up resources here


all_mlm_l6: SentenceTransformer = None
server = FastAPI(
    title='LabTronic AI Server',
    description='LabTronic AI is designed to provide guidance to the operator of this device.',
    version='1.0.0',
    lifespan=lifespan,
)
server.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


@server.get('/api/test')
async def get_test() -> Literal['LTAI_SERVER_ONLINE'] | None:
    return JSONResponse(content='LTAI_SERVER_ONLINE')


@server.post('/api/update-kdb')
async def update_kdb(device_model: str = Body(embed=True)) -> Literal['OK'] | None:
    device_data_path = os.path.join('data', device_model + '.json')
    if not os.path.exists(device_data_path):
        return JSONResponse(content='No Data File Found for this Device Model', status_code=404)
    with open(device_data_path, 'r') as f:
        device_dataset = json.loads(f.read())
    sections = device_dataset['sections']
    for _section in sections:
        kdb_queries: list[str] = _section['queries']
        _section['queries_embeddings'] = [all_mlm_l6.encode(q, normalize_embeddings=True).tolist() for q in kdb_queries]
    with open(os.path.join('cache', device_model + '.cache.json'), 'w') as f:
        f.write(json.dumps(sections, indent=2))
    with open('_.json', 'r') as f:
        state_object = json.loads(f.read())
    state_object[device_model]['last_kdb_update'] = str(datetime.now()).split('.')[0]
    with open('_.json', 'w') as f:
        f.write(json.dumps(state_object, indent=2))
    return JSONResponse(content='OK')


@server.post('/api/query')
async def query(device_model: str = Body(), query: str = Body()) -> str | None:
    device_kdb_path = os.path.join('cache', device_model + '.cache.json')
    if not os.path.exists(device_kdb_path):
        return JSONResponse(content='No Knowledge Database File Found for this Device Model, Train the Model First', status_code=404)
    with open(device_kdb_path, 'r') as f:
        device_kdb = json.loads(f.read())
    query_ev = all_mlm_l6.encode(query, normalize_embeddings=True)
    qsim: list[tuple[int, float]] = []
    for idx, query_data in enumerate(device_kdb):
        for _ev in query_data['queries_embeddings']:
            target_ev = np.array(_ev, dtype=np.float32)
            sim = np.dot(query_ev, target_ev)
            qsim.append((idx, sim))
    best_match_idx, best_match_score = max(qsim, key=lambda x: x[1])
    if best_match_score < 0.3:
        return JSONResponse(content='UNKNOWN_QUERY')
    return JSONResponse(content=device_kdb[best_match_idx]['text'])


@server.post('/api/example-queries')
async def example_queries(device_model: str = Body(), examples_number: int = Body()) -> list[str] | None:
    device_kdb_path = os.path.join('cache', device_model + '.cache.json')
    if not os.path.exists(device_kdb_path):
        return JSONResponse(content='No Knowledge Database File Found for this Device Model, Train the Model First', status_code=404)
    with open(device_kdb_path, 'r') as f:
        device_kdb = json.loads(f.read())
    device_queries: list[str] = []
    for query_data in device_kdb:
        device_queries += query_data['queries']
    if examples_number > len(device_queries):
        return JSONResponse(content='Too Large Examples Number', status_code=400)
    return JSONResponse(content=random.sample(device_queries, examples_number))


@server.post('/api/get-last-kdb-update')
async def get_last_kdb_update(device_model: str = Body(embed=True)) -> str | None:
    with open('_.json', 'r') as f:
        state_object = json.loads(f.read())
    if device_model not in state_object:
        return JSONResponse(content='Device Model not Found', status_code=404)
    return state_object[device_model]['last_kdb_update']


if __name__ == '__main__':
    load_log_config()
    uvicorn.run(server, host='127.0.0.1', port=8091)
