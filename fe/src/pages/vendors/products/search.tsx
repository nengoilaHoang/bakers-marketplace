import { useState, type FormEvent } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import ProductTable from '@/components/product/ProductTable';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import VendorPage from '@/components/vendor/VendorPage';
import useAuth from '@/hooks/user/useAuthContext';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';

const SearchPage: NextPageWithLayout = () => {
  const { account } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await productApi.search(keyword);
      // API tìm trên mọi cửa hàng; khu vendor chỉ hiện sản phẩm của mình.
      setResults(response.data.filter((product) => product.vendorId === account?.id));
    } catch (searchError) {
      setError((searchError as Error).message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <VendorPage
      title='Tìm sản phẩm'
      breadcrumb={[{ label: 'Sản phẩm', href: '/vendors/products' }, { label: 'Tìm kiếm' }]}
    >
      <form onSubmit={(event) => void handleSearch(event)} className='flex flex-wrap gap-3'>
        <div className='w-full sm:w-96'>
          <Input
            type='search'
            size='sm'
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder='Nhập tên sản phẩm'
            aria-label='Từ khoá tìm kiếm'
          />
        </div>
        <Button type='submit' disabled={loading}>
          <Icon name='search' className='size-4' />
          {loading ? 'Đang tìm…' : 'Tìm'}
        </Button>
      </form>

      {error && <Alert tone='danger'>{error}</Alert>}

      {results &&
        (results.length === 0 ? (
          <EmptyState
            icon='search'
            title='Không tìm thấy sản phẩm nào'
            description='Thử từ khoá khác hoặc kiểm tra lại chính tả.'
          />
        ) : (
          <>
            <p className='text-body-sm text-ink-muted'>Tìm thấy {results.length} sản phẩm.</p>
            <ProductTable products={results} />
          </>
        ))}
    </VendorPage>
  );
};

SearchPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default SearchPage;
