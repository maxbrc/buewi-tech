package main

import (
	"fmt"
	"os"

	"github.com/bm-dynamics/buewi-tech/server/api"
	"github.com/bm-dynamics/buewi-tech/server/config"
	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

func main() {
	err := db.InitClient()
	if err != nil {
		fmt.Printf("Failed to initialize database: %v", err)
		os.Exit(1)
	}

	err = auth.LoadKeys()
	if err != nil {
		fmt.Printf("failed to load ed25519 seed: %v", err)
		os.Exit(1)
	}

	fmt.Println("Bind Address:", config.AppConfig.BindAddress)

	err = api.SetupRoutes()
	fmt.Printf("http listener errored: %v", err)
	os.Exit(1)
}
