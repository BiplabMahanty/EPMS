import { useEmployeeStore } from '../../store';
import { employeeAuthApi, empProductsApi, empCategoriesApi, empPartiesApi, empTaxApi, empInvoicesApi } from '../../services/api';
import { POSView } from '../sales/SaleForm';

const empApis = {
  products: empProductsApi,
  categories: empCategoriesApi,
  parties: empPartiesApi,
  tax: empTaxApi,
  invoices: empInvoicesApi,
};

export default function EmployeeSaleForm() {
  const employee = useEmployeeStore((s) => s.employee);
  return <POSView user={employee} createSale={(d) => employeeAuthApi.createSale(d)} apis={empApis} />;
}
