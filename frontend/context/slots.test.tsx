import { render } from '@/test/utils';

import { SlotsProvider, createSlot } from './slots';

describe('createSlot', () => {
  it('should render the content of Fill in Slot', async () => {
    const { Slot, Fill } = createSlot();
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Test</Fill>
        </div>
      </SlotsProvider>
    );
    expect(container.innerHTML).toEqual('<div><div id="slot">Test</div></div>');
  });

  it('should render duplicated Fill in the order they are defined', async () => {
    const { Slot, Fill } = createSlot();
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Test</Fill>
          <Fill>Test2</Fill>
        </div>
      </SlotsProvider>
    );
    expect(container.innerHTML).toEqual('<div><div id="slot">TestTest2</div></div>');
  });

  it('should isolate Slot/Fill pairs from each other', async () => {
    const A = createSlot();
    const B = createSlot();
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="A">
            <A.Slot />
          </div>
          <div id="B">
            <B.Slot />
          </div>
          <A.Fill>A</A.Fill>
          <B.Fill>B</B.Fill>
        </div>
      </SlotsProvider>
    );
    expect(container.innerHTML).toEqual('<div><div id="A">A</div><div id="B">B</div></div>');
  });
});
