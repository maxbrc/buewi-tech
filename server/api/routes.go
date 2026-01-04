package api

import (
	"net/http"
	"path/filepath"

	"github.com/bm-dynamics/buewi-tech/server/api/handlers"
	"github.com/bm-dynamics/buewi-tech/server/config"
)

func SetupRoutes() error {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/items", handlers.GetItems)
	mux.HandleFunc("GET /api/items/{sn}", handlers.GetItemBySerialNumber)
	mux.HandleFunc("POST /api/items", handlers.PostItems)
	mux.HandleFunc("DELETE /api/items/{sn}", handlers.DeleteItems)
	mux.HandleFunc("PATCH /api/items/{sn}", handlers.PatchItems)

	mux.HandleFunc("GET /api/categories", handlers.GetCategories)
	mux.HandleFunc("GET /api/conditions", handlers.GetConditions)

	mux.HandleFunc("GET /api/borrowing-events", handlers.GetBorrowingEvents)

	mux.HandleFunc("GET /api/locations", handlers.GetLocations)

	mux.HandleFunc("POST /api/users", handlers.PostUsers)
	mux.HandleFunc("GET /api/users/{id}", handlers.GetUser)

	mux.HandleFunc("GET /api/manuals", handlers.GetManuals)
	mux.HandleFunc("POST /api/manuals", handlers.PostManual)

	mux.HandleFunc("POST /api/login", handlers.PostLogin)
	mux.HandleFunc("POST /api/logout", handlers.PostLogout)
	mux.HandleFunc("GET /api/refresh-token", handlers.RefreshToken)

	distDir := "../client/dist"
	distFs := http.FileServer(http.Dir(filepath.Join(distDir, "static")))
	mux.Handle("GET /static/", http.StripPrefix("/static", distFs))

	filesFs := http.FileServer(http.Dir("files"))
	mux.Handle("GET /files/", http.StripPrefix("/files", filesFs))

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
	})

	return http.ListenAndServe(config.AppConfig.BindAddress, mux)
}
