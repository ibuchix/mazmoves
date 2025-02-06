import { useEffect } from "react";
import { UseFormWatch, UseFormRegister } from "react-hook-form";
import { CompanyRegistrationForm } from "@/types/company";

interface CountrySelectorProps {
  register: UseFormRegister<CompanyRegistrationForm>;
  watch: UseFormWatch<CompanyRegistrationForm>;
  errors: any;
  onCountryChange: (country: { code: string; name: string } | undefined) => void;
}

export function CountrySelector({ register, watch, errors, onCountryChange }: CountrySelectorProps) {
  const countryValue = watch('country');
  
  useEffect(() => {
    if (countryValue) {
      try {
        const countryData = JSON.parse(countryValue);
        onCountryChange(countryData);
      } catch (e) {
        console.error('Error parsing country data:', e);
      }
    }
  }, [countryValue, onCountryChange]);

  const allowedCountries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "NZ", name: "New Zealand" }
  ];

  return (
    <select 
      {...register("country")}
      className="w-full h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 rounded-md"
      defaultValue=""
    >
      <option value="">Select your country (optional)</option>
      {allowedCountries.map((country) => (
        <option key={country.code} value={JSON.stringify(country)}>
          {country.name}
        </option>
      ))}
    </select>
  );
}