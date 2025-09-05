import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Slider,
  Chip,
  Autocomplete,
  Switch,
  IconButton,
  Tooltip,
  Badge,
  Stack,
} from "@mui/material";
import {
  Search,
  ExpandMore,
  FilterList,
  Clear,
  LocationOn,
  DirectionsCar,
  Euro,
  Settings,
  Save,
  Bookmark,
  SortByAlpha,
  ViewList,
  ViewModule,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface Category {
  id: string;
  name: string;
  displayName: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface SearchFilters {
  query: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  location: string;
  priceRange: [number, number];
  yearRange: [number, number];
  mileageRange: [number, number];
  fuelType: string[];
  transmission: string[];
  bodyType: string[];
  color: string[];
  features: string[];
  condition: string;
  currency: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  category: {
    id: string;
    name: string;
    displayName: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  model?: {
    id: string;
    name: string;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  viewCount: number;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  alertEnabled: boolean;
}

interface AdvancedSearchProps {
  onSearchResults: (results: SearchResult[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchResults,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    categoryId: "",
    brandId: "",
    modelId: "",
    location: "",
    priceRange: [0, 10000000],
    yearRange: [1990, new Date().getFullYear()],
    mileageRange: [0, 1000000],
    fuelType: [],
    transmission: [],
    bodyType: [],
    color: [],
    features: [],
    condition: "",
    currency: "TRY",
    sortBy: "createdAt",
    sortOrder: "desc",
    viewMode: "grid",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(["basic"]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Available filter options
  const fuelTypes = ["Benzin", "Dizel", "LPG", "Hybrid", "Elektrik", "CNG"];
  const transmissionTypes = ["Manuel", "Otomatik", "Yarı Otomatik", "CVT"];
  const conditions = ["Sıfır", "2. El", "Hasarlı", "Değişen"];
  const sortOptions = [
    { value: "createdAt", label: "Tarih" },
    { value: "price", label: "Fiyat" },
    { value: "year", label: "Model Yılı" },
    { value: "mileage", label: "Kilometre" },
    { value: "viewCount", label: "Popülerlik" },
  ];

  // Search function
  const performSearch = useCallback(
    async (searchFilters: SearchFilters) => {
      try {
        setLoading(true);
        const response = await apiClient.post("/ads/search", searchFilters);
        onSearchResults(response.data as SearchResult[]);
      } catch (error) {
        console.error("Search error:", error);
        onSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearchResults]
  );

  // Search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(filters);
    }, 300);

    onFiltersChange(filters);

    return () => clearTimeout(timeoutId);
  }, [filters, performSearch, onFiltersChange]);

  // Count active filters
  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === "query" && value) return acc + 1;
      if (key === "categoryId" && value) return acc + 1;
      if (key === "brandId" && value) return acc + 1;
      if (key === "modelId" && value) return acc + 1;
      if (key === "location" && value) return acc + 1;
      if (key === "condition" && value) return acc + 1;
      if (Array.isArray(value) && value.length > 0) return acc + 1;
      if (key === "priceRange" && (value[0] > 0 || value[1] < 10000000))
        return acc + 1;
      if (
        key === "yearRange" &&
        (value[0] > 1990 || value[1] < new Date().getFullYear())
      )
        return acc + 1;
      if (key === "mileageRange" && (value[0] > 0 || value[1] < 1000000))
        return acc + 1;
      return acc;
    }, 0);
    setActiveFiltersCount(count);
  }, [filters]);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadLocations();
    loadSavedSearches();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response.data as Category[]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadBrands = async (categoryId: string) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/brands`);
      setBrands(response.data as Brand[]);
    } catch (error) {
      console.error("Failed to load brands:", error);
    }
  };

  const loadModels = async (brandId: string) => {
    try {
      const response = await apiClient.get(
        `/categories/brands/${brandId}/models`
      );
      setModels(response.data as Model[]);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await apiClient.get("/locations");
      setLocations(response.data as string[]);
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const response = await apiClient.get("/search/saved");
      setSavedSearches(response.data as SavedSearch[]);
    } catch (error) {
      console.error("Failed to load saved searches:", error);
    }
  };

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number | string[] | [number, number] | boolean
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Reset dependent filters
      if (key === "categoryId") {
        newFilters.brandId = "";
        newFilters.modelId = "";
        setBrands([]);
        setModels([]);
        if (value && typeof value === "string") loadBrands(value);
      }

      if (key === "brandId") {
        newFilters.modelId = "";
        setModels([]);
        if (value && typeof value === "string") loadModels(value);
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      query: "",
      categoryId: "",
      brandId: "",
      modelId: "",
      location: "",
      priceRange: [0, 10000000],
      yearRange: [1990, new Date().getFullYear()],
      mileageRange: [0, 1000000],
      fuelType: [],
      transmission: [],
      bodyType: [],
      color: [],
      features: [],
      condition: "",
      currency: "TRY",
      sortBy: "createdAt",
      sortOrder: "desc",
      viewMode: "grid",
    });
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
  };

  const toggleFilterExpansion = (filterName: string) => {
    setExpandedFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: filters.currency,
    }).format(amount);
  };

  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    filterKey: string
  ) => (
    <Accordion
      expanded={expandedFilters.includes(filterKey)}
      onChange={() => toggleFilterExpansion(filterKey)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );

  return (
    <Box>
      {/* Search Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Araç, marka, model ara..."
            value={filters.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => toggleFilterExpansion("basic")}
            >
              Filtreler
            </Button>
          </Badge>
          <Tooltip title="Filtreleri Temizle">
            <IconButton
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
            >
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {filters.categoryId && (
            <Chip
              label={`Kategori: ${
                categories.find((c) => c.id === filters.categoryId)?.displayName
              }`}
              onDelete={() => handleFilterChange("categoryId", "")}
              color="primary"
              size="small"
            />
          )}
          {filters.location && (
            <Chip
              label={`Konum: ${filters.location}`}
              onDelete={() => handleFilterChange("location", "")}
              color="primary"
              size="small"
            />
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) && (
            <Chip
              label={`Fiyat: ${formatCurrency(
                filters.priceRange[0]
              )} - ${formatCurrency(filters.priceRange[1])}`}
              onDelete={() => handleFilterChange("priceRange", [0, 10000000])}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Advanced Filters */}
      <Paper sx={{ mb: 3 }}>
        {/* Basic Filters */}
        {renderFilterSection(
          "Temel Filtreler",
          <DirectionsCar />,
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={filters.categoryId}
                label="Kategori"
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!filters.categoryId}>
              <InputLabel>Marka</InputLabel>
              <Select
                value={filters.brandId}
                label="Marka"
                onChange={(e) => handleFilterChange("brandId", e.target.value)}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!filters.brandId}>
              <InputLabel>Model</InputLabel>
              <Select
                value={filters.modelId}
                label="Model"
                onChange={(e) => handleFilterChange("modelId", e.target.value)}
              >
                {models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              options={locations}
              value={filters.location}
              onChange={(_, newValue) =>
                handleFilterChange("location", newValue || "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Konum"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <LocationOn sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              )}
            />

            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={filters.condition}
                label="Durum"
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>,
          "basic"
        )}

        {/* Price & Year Filters */}
        {renderFilterSection(
          "Fiyat ve Yıl",
          <Euro />,
          <Box>
            <Typography gutterBottom>
              Fiyat Aralığı: {formatCurrency(filters.priceRange[0])} -{" "}
              {formatCurrency(filters.priceRange[1])}
            </Typography>
            <Slider
              value={filters.priceRange}
              onChange={(_, newValue) =>
                handleFilterChange("priceRange", newValue as [number, number])
              }
              valueLabelDisplay="auto"
              min={0}
              max={10000000}
              step={50000}
              valueLabelFormat={(value) => formatCurrency(value)}
            />
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>
                Model Yılı: {filters.yearRange[0]} - {filters.yearRange[1]}
              </Typography>
              <Slider
                value={filters.yearRange}
                onChange={(_, newValue) =>
                  handleFilterChange("yearRange", newValue as [number, number])
                }
                valueLabelDisplay="auto"
                min={1990}
                max={new Date().getFullYear()}
                step={1}
              />
            </Box>
          </Box>,
          "price"
        )}

        {/* Technical Specifications */}
        {renderFilterSection(
          "Teknik Özellikler",
          <Settings />,
          <Stack spacing={2}>
            <Box>
              <Typography gutterBottom>Yakıt Türü</Typography>
              {fuelTypes.map((fuel) => (
                <FormControlLabel
                  key={fuel}
                  control={
                    <Checkbox
                      checked={filters.fuelType.includes(fuel)}
                      onChange={(e) => {
                        const newFuelTypes = e.target.checked
                          ? [...filters.fuelType, fuel]
                          : filters.fuelType.filter((f) => f !== fuel);
                        handleFilterChange("fuelType", newFuelTypes);
                      }}
                    />
                  }
                  label={fuel}
                />
              ))}
            </Box>
            <Box>
              <Typography gutterBottom>Şanzıman</Typography>
              {transmissionTypes.map((transmission) => (
                <FormControlLabel
                  key={transmission}
                  control={
                    <Checkbox
                      checked={filters.transmission.includes(transmission)}
                      onChange={(e) => {
                        const newTransmissions = e.target.checked
                          ? [...filters.transmission, transmission]
                          : filters.transmission.filter(
                              (t) => t !== transmission
                            );
                        handleFilterChange("transmission", newTransmissions);
                      }}
                    />
                  }
                  label={transmission}
                />
              ))}
            </Box>
          </Stack>,
          "technical"
        )}

        {/* Sorting & View Options */}
        {renderFilterSection(
          "Sıralama ve Görünüm",
          <SortByAlpha />,
          <Stack spacing={2} direction="row" alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sırala</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sırala"
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.sortOrder === "desc"}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortOrder",
                      e.target.checked ? "desc" : "asc"
                    )
                  }
                />
              }
              label="Azalan Sıralama"
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Kart Görünümü">
                <IconButton
                  color={filters.viewMode === "grid" ? "primary" : "default"}
                  onClick={() => handleFilterChange("viewMode", "grid")}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
              <Tooltip title="Liste Görünümü">
                <IconButton
                  color={filters.viewMode === "list" ? "primary" : "default"}
                  onClick={() => handleFilterChange("viewMode", "list")}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>,
          "sorting"
        )}
      </Paper>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Kayıtlı Aramalar
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {savedSearches.map((savedSearch) => (
              <Chip
                key={savedSearch.id}
                label={savedSearch.name}
                icon={<Bookmark />}
                onClick={() => loadSavedSearch(savedSearch)}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Search Actions */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Save />}
          disabled={activeFiltersCount === 0}
        >
          Aramayı Kaydet
        </Button>
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={() => performSearch(filters)}
          disabled={loading}
        >
          {loading ? "Aranıyor..." : "Ara"}
        </Button>
      </Box>
    </Box>
  );
};

export default AdvancedSearch;
