const HIGHLIGHTS = [
  { label: 'Khẩu phần', value: 'Khoảng 10', large: false },
  { label: 'Calo', value: '40', large: true },
  { label: 'Tổng chất béo', value: '5 g', large: true },
];

const ROWS: Array<[string, string]> = [
  ['Carbohydrate', '10g'],
  ['Chất đạm', '10g'],
  ['Tổng chất béo', '10g'],
  ['Chất béo bão hòa', '10g'],
  ['Chất béo không bão hòa đa', '10g'],
  ['Chất béo không bão hòa đơn', '10g'],
  ['Chất béo chuyển hóa', '10g'],
  ['Chất xơ', '10g'],
  ['Cholesterol', '10g'],
  ['Natri', '10g'],
  ['Kali', '10g'],
];

const MICROS: Array<[string, string]> = [
  ['Vitamin A', '12IU'],
  ['Canxi', '12mg'],
  ['Sắt', '12mg'],
  ['Tổng lượng đường', '12g'],
];

function Row({ name, amount }: { name: string; amount: string }) {
  return (
    <tr className='border-b border-line'>
      <th scope='row' className='py-1.5 pr-3 pl-0.5 text-left font-medium'>
        {name}
      </th>
      <td className='py-1.5'>{amount}</td>
      <td className='py-1.5 pr-0.5 text-right font-medium'>15%</td>
    </tr>
  );
}

// Bảng thông tin dinh dưỡng.
export default function NutritionFacts() {
  return (
    <section className='w-full max-w-sm bg-linear-to-b from-primary-tint to-primary-tint/60 px-4 py-3 shadow-[-3px_3px_3px_0_rgb(0_0_0/0.25)]'>
      <h3 className='text-h4 font-semibold text-ink uppercase'>Thông tin dinh dưỡng</h3>
      <div className='mt-2 h-1 bg-accent' />
      <dl className='mt-3 grid grid-cols-3 divide-x divide-ink/30 bg-highlight-soft px-2 py-1.5 text-center text-ink-muted'>
        {HIGHLIGHTS.map((item) => (
          <div key={item.label} className='flex flex-col'>
            <dt className='text-meta font-semibold uppercase'>{item.label}</dt>
            <dd className={item.large ? 'text-h4' : 'text-body-sm font-medium'}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <table className='mt-3 w-full text-body-sm text-ink-muted'>
        <caption className='sr-only'>Giá trị dinh dưỡng mỗi khẩu phần</caption>
        <thead>
          <tr className='border-b-2 border-ink-muted bg-line/40'>
            <th colSpan={3} className='py-1 text-right text-micro font-medium'>
              % Giá trị hằng ngày*
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([name, amount]) => (
            <Row key={name} name={name} amount={amount} />
          ))}
        </tbody>
        <tbody className='border-t-2 border-accent'>
          {MICROS.map(([name, amount]) => (
            <Row key={name} name={name} amount={amount} />
          ))}
        </tbody>
      </table>
    </section>
  );
}
