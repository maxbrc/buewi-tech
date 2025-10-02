package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	BindAddress           string `json:"bind_address"`
	MySQLConnectionString string `json:"mysql_connection_string"`
	Ed25519SeedPath       string `json:"ed25519_seed_path"`
}

var AppConfig = &Config{
	BindAddress:           "0.0.0.0:8080",
	MySQLConnectionString: "user:pass@localhost/db",
	Ed25519SeedPath:       "/opt/bwtech/secrets/ed25519_seed.bin",
}

func LoadConfig() error {
	data, err := os.ReadFile("config/config.json")
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Println("Did not find config.json. Using default values.")
			return nil
		} else {
			return fmt.Errorf("failed to read config file: %v", err)
		}
	}

	var parsedConfig Config
	err = json.Unmarshal(data, &parsedConfig)
	if err != nil {
		return fmt.Errorf("failed to unmarshal config: %v", err)
	}

	if parsedConfig.BindAddress != "" {
		AppConfig.BindAddress = parsedConfig.BindAddress
	}

	if parsedConfig.MySQLConnectionString != "" {
		AppConfig.MySQLConnectionString = parsedConfig.MySQLConnectionString
	}

	if parsedConfig.Ed25519SeedPath != "" {
		AppConfig.Ed25519SeedPath = parsedConfig.Ed25519SeedPath
	}

	return nil
}

func init() {
	err := LoadConfig()
	if err != nil {
		fmt.Printf("Error while loading config.json: %v! Using defaults!", err)
	}
}
