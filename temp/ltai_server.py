# print('Loading Model...')
# model = SentenceTransformer('e5-base-v2')
# print('decompressing...')
# with open('compress', 'rb') as f:
#     out = gzip.decompress(f.read())
# with open('decompress', 'wb') as fc:
#     fc.write(out)
# print('Model Loaded')
# embeddings = st_e5.encode(input_texts, normalize_embeddings=True)
# batch_dict = tokenizer(input_texts, max_length=512, padding=True, truncation=True, return_tensors='pt')
# outputs = model(**batch_dict)
# embeddings = average_pool(outputs.last_hidden_state, batch_dict['attention_mask'])
# embeddings = F.normalize(embeddings, p=2, dim=1)
# scores = (embeddings[:2] @ embeddings[2:].T) * 100
# print(scores.tolist())


# def __cmp(s1: str, s2: str) -> float:
#     embeddings = all_mlm_l6.encode([s1, s2], normalize_embeddings=True)
#     return np.dot(embeddings[0], embeddings[1])
