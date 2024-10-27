import requests


api_url = 'http://127.0.0.1:8091/api'


def test_server_online():
    http_res = requests.get(api_url + '/test')
    assert http_res.status_code == 200
    assert http_res.json() == 'LTAI_SERVER_ONLINE'
