.PHONY: help install install-py install-js backend frontend train evaluate \
        docker docker-up docker-down docker-logs clean

help:
	@echo "WarLens — common tasks"
	@echo ""
	@echo "  make install        Install both Python and Node dependencies"
	@echo "  make install-py     Install Python deps (backend/requirements.txt)"
	@echo "  make install-js     Install Node deps (frontend/package.json)"
	@echo ""
	@echo "  make backend        Run the Flask backend on :5000"
	@echo "  make frontend       Run the React dev server on :3000"
	@echo ""
	@echo "  make train          Train ResNet50 on dataset/"
	@echo "  make evaluate       Open the evaluation notebook"
	@echo ""
	@echo "  make docker         Build and start the full stack with docker compose"
	@echo "  make docker-up      Start docker stack in the background"
	@echo "  make docker-down    Stop the docker stack"
	@echo "  make docker-logs    Tail docker logs"
	@echo ""
	@echo "  make clean          Remove caches, build artefacts, uploads"

install: install-py install-js

install-py:
	pip install -r backend/requirements.txt

install-js:
	cd frontend && npm install

backend:
	cd backend && python app.py

frontend:
	cd frontend && REACT_APP_API_URL=http://localhost:5000 npm start

train:
	python model/train_resnet50.py

evaluate:
	jupyter notebook model/evaluation.ipynb

docker: docker-up

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	rm -rf frontend/build frontend/dist backend/uploads
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
